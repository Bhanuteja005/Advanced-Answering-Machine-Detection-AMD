/**
 * POST /api/webhooks/jambonz/amd
 * Handles Jambonz AMD (Answering Machine Detection) results
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Jambonz AMD webhook', { body });

    const { 
      call_sid, 
      amd_result, 
      amd_confidence,
      greeting_duration_ms,
      speaking_duration_ms,
      silence_duration_ms,
      tag 
    } = body;

    const callLogId = tag?.callLogId;

    if (!callLogId) {
      logger.warn('No callLogId in Jambonz AMD webhook', { body });
      return NextResponse.json({ error: 'Missing callLogId' }, { status: 400 });
    }

    // Map Jambonz AMD results to our format
    // Jambonz typically returns: 'human', 'machine', 'unknown'
    const resultMap: Record<string, string> = {
      'human': 'human',
      'machine': 'machine',
      'machine-start': 'machine_start',
      'machine-end-beep': 'machine_end_beep',
      'machine-end-silence': 'machine_end_silence',
      'fax': 'fax',
      'unknown': 'unknown',
    };

    const amdResult = resultMap[amd_result] || amd_result || 'unknown';
    const confidence = amd_confidence ? parseFloat(amd_confidence) : 0;

    // Update call log with AMD results
    await prisma.callLog.update({
      where: { id: callLogId },
      data: {
        amdResult,
        confidence,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          greeting_duration_ms,
          speaking_duration_ms,
          silence_duration_ms,
          jambonz_raw_result: amd_result,
        }
      } as any,
    });

    logger.info('Updated call with Jambonz AMD result', {
      callLogId,
      amdResult,
      confidence,
      greetingDuration: greeting_duration_ms,
    });

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'AMD result processed'
    });

  } catch (error) {
    logger.error('Error in Jambonz AMD webhook', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
