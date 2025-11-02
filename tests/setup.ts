/**
 * Test setup file
 * Runs before all tests
 */
import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://postgres:test@localhost:5432/amd_test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.TWILIO_ACCOUNT_SID = 'ACtest123';
  process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
  process.env.TWILIO_NUMBER = '+12345678900';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
});

afterEach(() => {
  // Clean up any test data if needed
});

afterAll(() => {
  // Final cleanup
});
