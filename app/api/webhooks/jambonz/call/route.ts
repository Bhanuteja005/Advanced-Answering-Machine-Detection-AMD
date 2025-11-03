/**
 * POST /api/webhooks/jambonz/call
 * Handles Jambonz call events and returns TwiML-like instructions
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Jambonz call webhook', { body });

    const { call_sid, call_status, tag } = body;
    const callLogId = tag?.callLogId;

    if (!callLogId) {
      logger.warn('No callLogId in Jambonz webhook', { body });
      return NextResponse.json({ error: 'Missing callLogId' }, { status: 400 });
    }

    // Update call status
    if (call_status) {
      const statusMap: Record<string, string> = {
        'trying': 'initiated',
        'ringing': 'ringing',
        'in-progress': 'in-progress',
        'answered': 'in-progress',
        'completed': 'completed',
        'failed': 'failed',
        'busy': 'busy',
        'no-answer': 'no-answer',
      };

      const mappedStatus = statusMap[call_status] || call_status;

      await prisma.callLog.update({
        where: { id: callLogId },
        data: { 
          status: mappedStatus,
          updatedAt: new Date(),
        },
      });

      logger.info('Updated call status from Jambonz', { 
        callLogId, 
        callStatus: call_status, 
        mappedStatus 
      });
    }

    // Return Jambonz application instructions (similar to TwiML)
    // Play a message and gather to keep call active for AMD detection
    return NextResponse.json([
      {
        verb: 'say',
        text: 'Hello, this is a test call from our answering machine detection system.',
      },
      {
        verb: 'pause',
        length: 2,
      },
      {
        verb: 'say',
        text: 'We are testing voice detection capabilities to determine if this call is answered by a human or a machine.',
      },
      {
        verb: 'pause',
        length: 1,
      },
      {
        verb: 'say',
        text: 'Please press any key to continue, or simply stay on the line.',
      },
      {
        verb: 'pause',
        length: 3,
      },
      {
        verb: 'say',
        text: 'Thank you. This call will now end. Goodbye.',
      },
      {
        verb: 'hangup',
      }
    ]);

  } catch (error) {
    logger.error('Error in Jambonz call webhook', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
