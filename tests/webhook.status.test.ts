/**
 * Tests for POST /api/webhooks/twilio/status endpoint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/twilio/status/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/twilioClient', () => ({
  verifyTwilioSignature: vi.fn().mockReturnValue(true),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    callLog: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'call-123',
        twilioSid: 'CAtest123',
        userId: 'user-123',
        phone: '+12345678900',
        strategy: 'twilio',
        status: 'ringing',
        amdResult: null,
        rawEvents: [],
      }),
      update: vi.fn().mockResolvedValue({
        id: 'call-123',
        status: 'answered',
        amdResult: 'human',
      }),
    },
  },
}));

describe('POST /api/webhooks/twilio/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process webhook and update call status', async () => {
    const formData = new FormData();
    formData.append('CallSid', 'CAtest123');
    formData.append('CallStatus', 'answered');
    formData.append('AnsweredBy', 'human');

    const request = new NextRequest('http://localhost:3000/api/webhooks/twilio/status', {
      method: 'POST',
      body: formData,
      headers: {
        'x-twilio-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should map machine detection results correctly', async () => {
    const formData = new FormData();
    formData.append('CallSid', 'CAtest123');
    formData.append('CallStatus', 'answered');
    formData.append('AnsweredBy', 'machine');

    const request = new NextRequest('http://localhost:3000/api/webhooks/twilio/status', {
      method: 'POST',
      body: formData,
      headers: {
        'x-twilio-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should handle undecided AMD results', async () => {
    const formData = new FormData();
    formData.append('CallSid', 'CAtest123');
    formData.append('CallStatus', 'answered');
    formData.append('AnsweredBy', 'unknown');

    const request = new NextRequest('http://localhost:3000/api/webhooks/twilio/status', {
      method: 'POST',
      body: formData,
      headers: {
        'x-twilio-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should return 404 for non-existent call', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.callLog.findUnique).mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.append('CallSid', 'CAnonexistent');
    formData.append('CallStatus', 'answered');

    const request = new NextRequest('http://localhost:3000/api/webhooks/twilio/status', {
      method: 'POST',
      body: formData,
      headers: {
        'x-twilio-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
