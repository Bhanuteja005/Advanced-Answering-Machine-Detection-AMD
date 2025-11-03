/**
 * POST /api/webhooks/twilio/status
 * Handles Twilio status callbacks for call progress and AMD results
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioSignature } from '@/lib/twilioClient';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the full URL for signature verification
    const url = request.url;
    
    // Get signature from headers
    const signature = request.headers.get('x-twilio-signature');
    
    if (!signature) {
      logger.warn('Missing Twilio signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Parse form data (Twilio sends form-urlencoded)
    const formData = await request.formData();
    const params: Record<string, any> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Verify Twilio signature
    const isValid = verifyTwilioSignature(signature, url, params);
    
    if (!isValid && process.env.NODE_ENV === 'production') {
      logger.warn('Invalid Twilio signature', { url });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const callSid = params.CallSid;
    const callStatus = params.CallStatus;
    const answeredBy = params.AnsweredBy; // human, machine, fax, unknown
    
    logger.info('Twilio webhook received', {
      callSid,
      callStatus,
      answeredBy,
    });

    // Find the call log by Twilio SID
    const callLog = await prisma.callLog.findUnique({
      where: { twilioSid: callSid },
    });

    if (!callLog) {
      logger.warn('Call log not found', { callSid });
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Map Twilio status to our status
    let status = callStatus.toLowerCase();
    let amdResult = callLog.amdResult;

    // Prepare update data
    const updateData: any = {
      status,
      rawEvents: [...((callLog.rawEvents as any[]) || []), params],
      updatedAt: new Date(),
    };

    // Process AMD result if available (only for Twilio native strategy)
    if (answeredBy && callLog.strategy === 'twilio') {
      const answeredByLower = answeredBy.toLowerCase();
      
      // Keep the detailed result from Twilio
      amdResult = answeredByLower;
      updateData.amdResult = amdResult;
      
      // Calculate confidence based on result type
      let confidence = 0.80; // Default confidence
      
      if (answeredByLower === 'human') {
        confidence = 0.85; // High confidence for human
      } else if (answeredByLower === 'machine_start' || answeredByLower === 'machine_end_beep') {
        confidence = 0.90; // Very high confidence for machine
      } else if (answeredByLower === 'fax') {
        confidence = 0.95; // Very high confidence for fax
      } else if (answeredByLower === 'unknown') {
        confidence = 0.50; // Low confidence for unknown
      }
      
      updateData.confidence = confidence;
      
      logger.info('AMD result processed', {
        callSid,
        answeredBy,
        amdResult,
        confidence,
      });
    }

    // Update call log
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: updateData,
    });

    logger.info('Call log updated', {
      callLogId: callLog.id,
      status,
      amdResult,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing Twilio webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
