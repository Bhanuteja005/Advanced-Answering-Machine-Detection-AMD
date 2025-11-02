/**
 * Twilio Media Streams WebSocket API
 * Handles real-time bidirectional audio streaming
 */

import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// This endpoint returns instructions for connecting via WebSocket
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('callSid');

  logger.info('Media Stream endpoint accessed', { callSid });

  return new Response(
    JSON.stringify({
      message: 'Media Stream WebSocket endpoint',
      instructions: 'Connect via WebSocket to wss://your-domain/api/media-stream',
      status: 'ready',
      callSid,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// The WebSocket connection is handled by the server
// See server.ts for WebSocket upgrade logic
