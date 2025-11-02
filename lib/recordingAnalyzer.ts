/**
 * Recording Analysis for Gemini and Hugging Face strategies
 * Analyzes call recordings after call completes
 */

import { prisma } from '@/lib/prisma';
import { twilioClient } from '@/lib/twilioClient';
import { logger } from '@/lib/logger';
import { detectWithGemini } from '@/lib/geminiAMD';

/**
 * Analyze recording for a completed call
 * Supports Gemini and Hugging Face strategies
 */
export async function analyzeRecording(twilioSid: string, callLogId: string) {
  try {
    logger.info('Starting recording analysis', { twilioSid, callLogId });

    // Get call log to check strategy
    const callLog = await prisma.callLog.findUnique({
      where: { id: callLogId },
    });

    if (!callLog) {
      logger.warn('CallLog not found for recording analysis', { callLogId });
      return;
    }

    // Only analyze for Gemini and Hugging Face strategies
    if (callLog.strategy !== 'gemini' && callLog.strategy !== 'huggingface') {
      logger.info('Skipping analysis for non-recording strategy', { strategy: callLog.strategy });
      return;
    }

    // Wait for recording to be ready (Twilio needs a few seconds)
    logger.info('Waiting for recording to be ready...', { twilioSid });
    await new Promise(resolve => setTimeout(resolve, 8000)); // Wait 8 seconds

    if (!twilioClient) {
      logger.error('Twilio client not available for recording fetch');
      return;
    }

    // Fetch recordings for this call
    logger.info('Fetching recordings from Twilio', { twilioSid });
    const recordings = await twilioClient.recordings.list({ 
      callSid: twilioSid, 
      limit: 1 
    });

    if (recordings.length === 0) {
      logger.error('No recordings found for call - analysis cannot proceed', { 
        twilioSid,
        strategy: callLog.strategy,
        message: 'Recording may not have been created or is not ready yet'
      });
      
      // DO NOT set fallback values - leave as null to indicate failure
      await prisma.callLog.update({
        where: { id: callLogId },
        data: {
          amdResult: 'error',
          confidence: 0,
        },
      });
      return;
    }

    const recording = recordings[0];
    const recordingUrl = `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;

    logger.info('Found recording, starting analysis', {
      twilioSid,
      recordingSid: recording.sid,
      recordingUrl,
      strategy: callLog.strategy,
      duration: recording.duration,
    });

    // Analyze based on strategy
    if (callLog.strategy === 'gemini') {
      await analyzeWithGemini(callLogId, recordingUrl, twilioSid);
    } else if (callLog.strategy === 'huggingface') {
      await analyzeWithHuggingFace(callLogId, recordingUrl, twilioSid);
    }

  } catch (error) {
    logger.error('Recording analysis failed', {
      twilioSid,
      callLogId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Update with error state - NO FALLBACK VALUES
    try {
      await prisma.callLog.update({
        where: { id: callLogId },
        data: {
          amdResult: 'error',
          confidence: 0,
        },
      });
    } catch (updateError) {
      logger.error('Failed to update call log with error state', { callLogId });
    }
  }
}

/**
 * Analyze recording using Google Gemini Flash
 */
async function analyzeWithGemini(callLogId: string, recordingUrl: string, twilioSid: string) {
  try {
    logger.info('Analyzing with Gemini Flash', { twilioSid, recordingUrl });

    const result = await detectWithGemini(recordingUrl);

    await prisma.callLog.update({
      where: { id: callLogId },
      data: {
        amdResult: result.result,
        confidence: result.confidence,
      },
    });

    logger.info('Gemini analysis complete', {
      twilioSid,
      result: result.result,
      confidence: result.confidence,
      reasoning: result.reasoning?.substring(0, 100),
    });
  } catch (error) {
    logger.error('Gemini analysis error', {
      twilioSid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Analyze recording using Hugging Face wav2vec service
 */
async function analyzeWithHuggingFace(callLogId: string, recordingUrl: string, twilioSid: string) {
  try {
    const hfServiceUrl = process.env.HUGGINGFACE_SERVICE_URL || 'http://localhost:8000';

    logger.info('Analyzing with Hugging Face', { twilioSid, recordingUrl, hfServiceUrl });

    // Send Twilio credentials to Python service so it can download the recording
    const response = await fetch(`${hfServiceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        recording_url: recordingUrl,
        twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
        twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HF service error: ${response.status} ${response.statusText}`);
    }

    const hfResult = await response.json();

    logger.info('Hugging Face response received', {
      twilioSid,
      result: hfResult,
    });

    await prisma.callLog.update({
      where: { id: callLogId },
      data: {
        amdResult: hfResult.result || hfResult.prediction || 'unknown',
        confidence: hfResult.confidence || hfResult.score || 0.5,
      },
    });

    logger.info('Hugging Face analysis complete', {
      twilioSid,
      result: hfResult.result || hfResult.prediction,
      confidence: hfResult.confidence || hfResult.score,
    });
  } catch (error) {
    logger.error('Hugging Face analysis error', {
      twilioSid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
