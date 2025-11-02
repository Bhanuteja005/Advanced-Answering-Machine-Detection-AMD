/**
 * Tests for POST /api/dial endpoint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/dial/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    callLog: {
      create: vi.fn().mockResolvedValue({
        id: 'call-123',
        userId: 'user-123',
        phone: '+12345678900',
        strategy: 'twilio',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({
        id: 'call-123',
        twilioSid: 'CAtest123',
        status: 'initiated',
      }),
    },
  },
}));

vi.mock('@/lib/twilioClient', () => ({
  twilioClient: {
    calls: {
      create: vi.fn().mockResolvedValue({
        sid: 'CAtest123',
        to: '+12345678900',
        from: '+12345678900',
        status: 'queued',
      }),
    },
  },
  TWILIO_FROM_NUMBER: '+12345678900',
}));

describe('POST /api/dial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a call successfully with valid input', async () => {
    const request = new NextRequest('http://localhost:3000/api/dial', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+12345678900',
        strategy: 'twilio',
        connectOnHuman: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.callLogId).toBe('call-123');
    expect(data.twilioSid).toBe('CAtest123');
  });

  it('should return 400 for invalid phone number', async () => {
    const request = new NextRequest('http://localhost:3000/api/dial', {
      method: 'POST',
      body: JSON.stringify({
        phone: 'invalid-phone',
        strategy: 'twilio',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('should return 400 for invalid strategy', async () => {
    const request = new NextRequest('http://localhost:3000/api/dial', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+12345678900',
        strategy: 'invalid',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('should use huggingface strategy when specified', async () => {
    const request = new NextRequest('http://localhost:3000/api/dial', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+12345678900',
        strategy: 'huggingface',
        connectOnHuman: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
