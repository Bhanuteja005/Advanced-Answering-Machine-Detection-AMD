/**
 * Better Auth Client
 * Client-side authentication utilities
 */

import { createAuthClient } from "better-auth/react";

// Get the base URL for auth - CRITICAL for production
const getAuthBaseURL = () => {
  // In production, MUST have NEXT_PUBLIC_BETTER_AUTH_URL set
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }

  // Fallback for development
  if (typeof window !== "undefined") {
    // Use current origin if available
    return window.location.origin;
  }

  // Last resort fallback
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
