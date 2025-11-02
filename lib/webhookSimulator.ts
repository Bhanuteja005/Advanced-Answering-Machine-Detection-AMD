/**
 * Webhook Simulator for Local Development
 * Simulates Twilio webhooks for AMD testing without ngrok
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface SimulatedWebhookData {
  CallSid: string;
  CallStatus: string;
  From: string;
  To: string;
  AnsweredBy?: 'human' | 'machine' | 'unknown';
  MachineDetectionDuration?: number;
  CallDuration?: number;
}

/**
 * Simulates Twilio status callback webhooks
 * This allows testing AMD without exposing localhost to internet
 */
export async function simulateWebhook(data: SimulatedWebhookData) {
  try {
    logger.info('Simulating Twilio webhook', data);

    // Find call by Twilio SID
    const callLog = await prisma.callLog.findFirst({
      where: { twilioSid: data.CallSid },
    });

    if (!callLog) {
      logger.warn('Call not found for webhook simulation', { CallSid: data.CallSid });
      return;
    }

    // Update based on status
    const updateData: any = {
      status: data.CallStatus,
      updatedAt: new Date(),
    };

    // Add AMD result if present
    if (data.AnsweredBy) {
      updateData.amdResult = data.AnsweredBy;
      
      // Calculate confidence based on detection duration
      const duration = data.MachineDetectionDuration || 0;
      let confidence = 0.85;
      
      if (duration < 2000) confidence = 0.95; // Fast detection = high confidence
      else if (duration < 4000) confidence = 0.85;
      else confidence = 0.75; // Slow detection = lower confidence
      
      updateData.confidence = confidence;
    }

    // Update call log
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: updateData,
    });

    logger.info('Webhook simulation completed', {
      callLogId: callLog.id,
      status: data.CallStatus,
      amdResult: data.AnsweredBy,
    });

    return callLog;
  } catch (error) {
    logger.error('Webhook simulation error', { error });
    throw error;
  }
}

/**
 * Poll Twilio for call status updates
 * Alternative to webhooks for local development
 */
export async function pollTwilioStatus(twilioSid: string, maxPolls = 30) {
  const { twilioClient } = await import('@/lib/twilioClient');
  
  let polls = 0;
  const pollInterval = 2000; // 2 seconds

  return new Promise((resolve, reject) => {
    const poller = setInterval(async () => {
      try {
        polls++;
        
        // Fetch call status from Twilio
        if (!twilioClient) {
        throw new Error('Twilio client not configured');
      }
      const call = await twilioClient.calls(twilioSid).fetch();
        
        logger.info('Polling Twilio status', {
          twilioSid,
          status: call.status,
          answeredBy: call.answeredBy,
          poll: polls,
        });

        // Update database
        const callLog = await prisma.callLog.findFirst({
          where: { twilioSid },
        });

        if (callLog) {
          await prisma.callLog.update({
            where: { id: callLog.id },
            data: {
              status: call.status,
              amdResult: call.answeredBy || undefined,
              confidence: call.answeredBy ? 0.85 : undefined,
            },
          });
        }

        // Stop polling if call is complete or failed
        if (
          call.status === 'completed' ||
          call.status === 'failed' ||
          call.status === 'canceled' ||
          call.status === 'busy' ||
          call.status === 'no-answer'
        ) {
          clearInterval(poller);
          resolve(call);
        }

        // Stop after max polls
        if (polls >= maxPolls) {
          clearInterval(poller);
          resolve(call);
        }
      } catch (error) {
        logger.error('Polling error', { error, twilioSid });
        clearInterval(poller);
        reject(error);
      }
    }, pollInterval);
  });
}
