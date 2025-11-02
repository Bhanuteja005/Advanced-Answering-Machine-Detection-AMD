/**
 * GET /api/twiml/handle-call
 * Returns TwiML to handle the call
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for answering. This is a test call for answering machine detection.</Say>
  <Pause length="2"/>
  <Say>Goodbye.</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export async function POST() {
  return GET();
}
