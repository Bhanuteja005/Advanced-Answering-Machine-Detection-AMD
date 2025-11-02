/**
 * Authentication utilities for Better Auth
 * Helper functions for authentication in API routes and server components
 */
import { auth } from './auth.config';
import { prisma } from './prisma';
import { logger } from './logger';
import { headers } from 'next/headers';

/**
 * Get authenticated user from Better Auth session
 * @returns User object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    logger.error('Error getting authenticated user', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Get or create user in Prisma database from Better Auth user
 * @param authUserId - Better Auth user ID
 * @param email - User email
 * @returns Prisma user object
 */
export async function getOrCreateUser(authUserId: string, email: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { id: authUserId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUserId,
          email,
        },
      });
      logger.info('Created new user in database', { userId: user.id, email });
    }

    return user;
  } catch (error) {
    logger.error('Error getting or creating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      authUserId,
      email,
    });
    throw error;
  }
}

/**
 * Require authentication for API routes
 * Returns user or throws error
 */
export async function requireAuth() {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    logger.warn('Authentication required but no user found');
    throw new Error('Unauthorized');
  }

  const user = await getOrCreateUser(authUser.id, authUser.email);
  logger.info('User authenticated', { userId: user.id, email: user.email });
  return user;
}
