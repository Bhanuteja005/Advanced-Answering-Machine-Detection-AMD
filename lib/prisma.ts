/**
 * Prisma client singleton
 * Ensures a single Prisma Client instance is reused across hot reloads in development
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add pgbouncer parameter to disable prepared statements for Supabase connection pooling
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  // Add pgbouncer=true to disable prepared statements (fixes "prepared statement already exists" error)
  return url.includes('?')
    ? `${url}&pgbouncer=true&statement_cache_size=0`
    : `${url}?pgbouncer=true&statement_cache_size=0`;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
