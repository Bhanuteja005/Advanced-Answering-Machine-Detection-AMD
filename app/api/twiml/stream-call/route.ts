/**
 * POST /api/twiml/stream-call
 * Returns TwiML with <Stream> verb for real-time audio
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    logger.info('Generating TwiML with Media Stream', { callSid, from, to });

    // Get base URL for WebSocket connection
    const hostHeader = request.headers.get('x-forwarded-host') || 
                       request.headers.get('host') || 
                       'localhost:3000';
    const streamUrl = `wss://${hostHeader}/api/media-stream`;

    // Generate TwiML with <Stream> verb
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${streamUrl}" name="AMD Stream">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="strategy" value="twilio-stream" />
    </Stream>
  </Start>
  <Say>Hello, this is a test call with real-time audio detection.</Say>
  <Pause length="3"/>
  <Say>This call is now complete. Thank you.</Say>
</Response>`;

    logger.info('TwiML generated with streaming enabled', { callSid, streamUrl });

    return new Response(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    logger.error('Error generating stream TwiML', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback TwiML without streaming
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. This call will now end.</Say>
</Response>`;

    return new Response(fallbackTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
