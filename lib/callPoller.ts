/**
 * Background Call Status Poller
 * Polls Twilio for call status updates when webhooks aren't available (localhost)
 */

import { prisma } from '@/lib/prisma';
import { twilioClient } from '@/lib/twilioClient';
import { logger } from '@/lib/logger';

// Track active polls
const activePolls = new Map<string, NodeJS.Timeout>();

/**
 * Start polling for a specific call
 */
export async function startPolling(twilioSid: string, callLogId: string) {
  // Don't start if already polling
  if (activePolls.has(twilioSid)) {
    logger.info('Already polling call', { twilioSid });
    return;
  }

  logger.info('Starting status polling', { twilioSid, callLogId });

  let pollCount = 0;
  const maxPolls = 60; // Poll for max 2 minutes (60 * 2s = 120s)
  const pollInterval = 2000; // 2 seconds

  const poller = setInterval(async () => {
    try {
      pollCount++;

      // Check if twilioClient is available
      if (!twilioClient) {
        logger.error('Twilio client not configured');
        stopPolling(twilioSid);
        return;
      }

      // Fetch current status from Twilio
      const call = await twilioClient.calls(twilioSid).fetch();

      logger.info('Poll result', {
        twilioSid,
        status: call.status,
        answeredBy: call.answeredBy,
        duration: call.duration,
        poll: pollCount,
      });

      // Prepare update data
      const updateData: any = {
        status: call.status,
        updatedAt: new Date(),
      };

      // Add AMD result if available (ONLY for Twilio native strategy)
      // Get call log to check strategy
      const callLog = await prisma.callLog.findUnique({
        where: { id: callLogId },
      });
      
      // Only set AMD result for Twilio native strategy
      if (callLog && callLog.strategy === 'twilio' && call.answeredBy) {
        const answeredByLower = call.answeredBy.toLowerCase();
        
        // Always update AMD result, even if 'unknown'
        updateData.amdResult = answeredByLower;
        
        // Calculate confidence based on result type
        let confidence = 0.80;
        
        // Twilio native AMD confidence scoring
        if (answeredByLower === 'human') {
          confidence = 0.85; // High confidence for human
        } else if (answeredByLower === 'machine_start' || answeredByLower === 'machine_end_beep') {
          confidence = 0.90; // Very high confidence for machine
        } else if (answeredByLower === 'fax') {
          confidence = 0.95; // Very high confidence for fax
        } else if (answeredByLower === 'unknown') {
          confidence = 0.50; // Low confidence for unknown
          logger.warn('Twilio returned unknown AMD result - call may have been too short', {
            twilioSid,
            duration: call.duration,
          });
        }
        
        updateData.confidence = confidence;

        logger.info('AMD result detected (Twilio Native)', {
          twilioSid,
          amdResult: answeredByLower,
          confidence,
        });
      }

      // Update database
      await prisma.callLog.update({
        where: { id: callLogId },
        data: updateData,
      });

      // Stop polling if call is in terminal state
      const terminalStates = ['completed', 'failed', 'canceled', 'busy', 'no-answer'];
      if (terminalStates.includes(call.status)) {
        logger.info('Call reached terminal state, stopping poll', {
          twilioSid,
          status: call.status,
        });
        stopPolling(twilioSid);
        
        // If call completed, trigger recording analysis for strategies that need it
        if (call.status === 'completed') {
          logger.info('Triggering recording analysis', { twilioSid, callLogId });
          import('@/lib/recordingAnalyzer').then(({ analyzeRecording }) => {
            analyzeRecording(twilioSid, callLogId).catch((error) => {
              logger.error('Failed to trigger recording analysis', {
                twilioSid,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            });
          });
        }
        
        return;
      }

      // Stop after max polls
      if (pollCount >= maxPolls) {
        logger.warn('Max polls reached, stopping', { twilioSid, pollCount });
        stopPolling(twilioSid);
        return;
      }
    } catch (error) {
      logger.error('Polling error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        twilioSid,
      });
      stopPolling(twilioSid);
    }
  }, pollInterval);

  // Store poller
  activePolls.set(twilioSid, poller);
}

/**
 * Stop polling for a specific call
 */
export function stopPolling(twilioSid: string) {
  const poller = activePolls.get(twilioSid);
  if (poller) {
    clearInterval(poller);
    activePolls.delete(twilioSid);
    logger.info('Stopped polling', { twilioSid });
  }
}

/**
 * Stop all active polls (cleanup)
 */
export function stopAllPolling() {
  activePolls.forEach((poller, twilioSid) => {
    clearInterval(poller);
    logger.info('Stopped polling (cleanup)', { twilioSid });
  });
  activePolls.clear();
}

// Cleanup on process exit
process.on('beforeExit', () => {
  stopAllPolling();
});
