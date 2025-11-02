/**
 * POST /api/calls/[id]/override
 * Manually override AMD result for a call
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth.helpers';
import { overrideRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = overrideRequestSchema.parse(body);

    // Find the call log
    const callLog = await prisma.callLog.findUnique({
      where: { id },
    });

    if (!callLog) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (callLog.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update AMD result
    const updated = await prisma.callLog.update({
      where: { id },
      data: {
        amdResult: validatedData.amdResult,
        confidence: 1.0, // Manual override has 100% confidence
        updatedAt: new Date(),
      },
    });

    logger.info('AMD result overridden', {
      callLogId: id,
      userId: user.id,
      newResult: validatedData.amdResult,
    });

    return NextResponse.json({
      success: true,
      call: {
        id: updated.id,
        amdResult: updated.amdResult,
        confidence: updated.confidence,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Error overriding AMD result', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
