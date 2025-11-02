/**
 * Google Gemini Flash AMD Service
 * Uses Gemini's multimodal capabilities for AMD detection
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY not configured');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface GeminiAMDResult {
  result: 'human' | 'machine' | 'undecided';
  confidence: number;
  reasoning: string;
  duration: number;
}

/**
 * Detect AMD using Google Gemini Flash
 */
export async function detectWithGemini(audioUrl: string): Promise<GeminiAMDResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured. Set GEMINI_API_KEY in .env');
  }

  try {
    logger.info('Starting Gemini AMD detection', { audioUrl });

    // Download audio with Twilio credentials (recordings require authentication)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured');
    }
    
    const authHeader = 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    const audioResponse = await fetch(audioUrl, {
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Get Gemini 2.0 Flash model (latest)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze this audio and determine if it's a human answering or an answering machine/voicemail.

Instructions:
1. Listen carefully to the audio
2. Identify characteristics of human vs machine speech:
   - Humans: Natural pauses, varied tone, spontaneous responses, background noise
   - Machines: Scripted messages, consistent tone, "leave a message", beep sounds
3. Provide your analysis in JSON format

Respond with JSON only (no markdown):
{
  "result": "human" or "machine",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of why you classified it this way"
}`;

    // Generate content with audio
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/wav',
          data: audioBase64,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    logger.info('Gemini response received', { text: text.substring(0, 200) });

    // Parse JSON response
    let parsed: any;
    try {
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      logger.error('Failed to parse Gemini response as JSON', { text });
      
      // Fallback: analyze text response
      const lowerText = text.toLowerCase();
      if (lowerText.includes('human') && !lowerText.includes('machine')) {
        parsed = {
          result: 'human',
          confidence: 0.7,
          reasoning: 'Gemini detected human characteristics in audio'
        };
      } else if (lowerText.includes('machine') || lowerText.includes('voicemail')) {
        parsed = {
          result: 'machine',
          confidence: 0.7,
          reasoning: 'Gemini detected machine/voicemail characteristics'
        };
      } else {
        parsed = {
          result: 'undecided',
          confidence: 0.5,
          reasoning: 'Unable to determine from Gemini response'
        };
      }
    }

    const amdResult: GeminiAMDResult = {
      result: parsed.result || 'undecided',
      confidence: parsed.confidence || 0.5,
      reasoning: parsed.reasoning || 'No reasoning provided',
      duration: 0, // Will be calculated from audio
    };

    logger.info('Gemini AMD detection complete', amdResult);

    return amdResult;

  } catch (error) {
    logger.error('Gemini AMD detection failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Return undecided on error
    return {
      result: 'undecided',
      confidence: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: 0,
    };
  }
}

/**
 * API endpoint for Gemini AMD detection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioUrl } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400 }
      );
    }

    const result = await detectWithGemini(audioUrl);

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Gemini AMD API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
