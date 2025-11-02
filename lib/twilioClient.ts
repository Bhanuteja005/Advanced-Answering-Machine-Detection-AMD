/**
 * Twilio client initialization
 * Provides configured Twilio client for making outbound calls and verifying webhooks
 */
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
  console.warn('Warning: Twilio credentials not configured. Some features will not work.');
}

/**
 * Twilio REST API client
 */
export const twilioClient = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

/**
 * Twilio phone number for outbound calls
 */
export const TWILIO_FROM_NUMBER = twilioNumber;

/**
 * Verify Twilio webhook signature
 * @param signature - X-Twilio-Signature header value
 * @param url - Full webhook URL
 * @param params - Request body parameters
 * @returns true if signature is valid
 */
export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  if (!authToken) {
    console.error('Cannot verify Twilio signature: auth token not configured');
    return false;
  }
  
  return twilio.validateRequest(authToken, signature, url, params);
}
