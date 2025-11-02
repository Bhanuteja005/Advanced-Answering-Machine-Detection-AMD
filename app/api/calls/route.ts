/**
 * GET /api/calls
 * Retrieves call history with filtering and pagination
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth.helpers';
import { callHistoryQuerySchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: any = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const validatedQuery = callHistoryQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (validatedQuery.strategy) {
      where.strategy = validatedQuery.strategy;
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.createdAt = {};
      if (validatedQuery.startDate) {
        where.createdAt.gte = new Date(validatedQuery.startDate);
      }
      if (validatedQuery.endDate) {
        where.createdAt.lte = new Date(validatedQuery.endDate);
      }
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Fetch calls
    const [calls, total] = await Promise.all([
      prisma.callLog.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          phone: true,
          strategy: true,
          status: true,
          amdResult: true,
          confidence: true,
          twilioSid: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.callLog.count({ where }),
    ]);

    logger.info('Call history retrieved', {
      userId: user.id,
      count: calls.length,
      total,
    });

    return NextResponse.json({
      calls,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        pages: Math.ceil(total / validatedQuery.limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Error retrieving call history', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
