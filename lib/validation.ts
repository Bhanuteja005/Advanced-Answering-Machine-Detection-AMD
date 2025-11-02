/**
 * Validation schemas using Zod
 * Centralized validation for API endpoints
 */
import { z } from 'zod';

/**
 * E.164 phone number validation
 * Format: +[country code][number]
 */
export const phoneSchema = z.string().regex(
  /^\+[1-9]\d{1,14}$/,
  'Phone number must be in E.164 format (e.g., +12345678900)'
);

/**
 * AMD strategy types
 * - twilio: Twilio's built-in AMD (~1-2s)
 * - twilio-stream: Twilio Media Streams with real-time audio (~2-3s)
 * - huggingface: Python service with signal processing (~2-5s)
 * - gemini: Google Gemini Flash AI (~3-5s)
 * - jambonz: Jambonz SIP platform (requires account)
 */
export const strategySchema = z.enum(['twilio', 'twilio-stream', 'huggingface', 'gemini', 'jambonz']);

/**
 * AMD result types
 */
export const amdResultSchema = z.enum(['human', 'machine', 'undecided']);

/**
 * Call status types
 */
export const callStatusSchema = z.enum([
  'pending',
  'ringing',
  'answered',
  'completed',
  'failed',
]);

/**
 * Dial request body schema
 */
export const dialRequestSchema = z.object({
  phone: phoneSchema,
  strategy: strategySchema,
  connectOnHuman: z.boolean().optional().default(false),
});

/**
 * Call override request schema
 */
export const overrideRequestSchema = z.object({
  amdResult: amdResultSchema,
});

/**
 * Call history query parameters
 */
export const callHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  strategy: strategySchema.optional(),
  status: callStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type DialRequest = z.infer<typeof dialRequestSchema>;
export type OverrideRequest = z.infer<typeof overrideRequestSchema>;
export type CallHistoryQuery = z.infer<typeof callHistoryQuerySchema>;
export type AmdResult = z.infer<typeof amdResultSchema>;
export type CallStatus = z.infer<typeof callStatusSchema>;
export type Strategy = z.infer<typeof strategySchema>;
