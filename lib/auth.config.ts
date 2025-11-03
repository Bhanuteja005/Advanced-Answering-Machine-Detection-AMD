/**
 * Better Auth Configuration
 * Replaces Supabase authentication with Better Auth
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get base URL for authentication
const getBaseURL = () => {
  // Production: Must have BETTER_AUTH_URL set
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // Vercel auto-detects
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development fallback
  return "http://localhost:3000";
};

const baseURL = getBaseURL();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session updated after this period)
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.vercel.app", // Allow all Vercel preview deployments
    baseURL,
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
