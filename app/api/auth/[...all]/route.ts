/**
 * Better Auth API Route
 * Handles all authentication requests
 */

import { auth } from "@/lib/auth.config";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
