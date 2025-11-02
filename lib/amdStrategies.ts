/**
 * AMD Strategy Factory
 * Abstracts different AMD detection strategies (Twilio Native, Hugging Face)
 */
import { logger } from './logger';
import type { Strategy } from './validation';

export interface AmdDetector {
  /**
   * Called when call is answered, before audio analysis
   */
  onAnswered(callSid: string, metadata: Record<string, any>): Promise<void>;

  /**
   * Process audio chunk (for streaming strategies like HF)
   */
  onAudioChunk?(callSid: string, audioData: Buffer): Promise<void>;

  /**
   * Finalize detection and return result
   */
  finalize(callSid: string): Promise<{
    result: 'human' | 'machine' | 'undecided';
    confidence?: number;
  }>;
}

/**
 * Twilio Native AMD Strategy
 * Relies on Twilio's built-in machine detection
 */
class TwilioNativeDetector implements AmdDetector {
  async onAnswered(callSid: string, metadata: Record<string, any>): Promise<void> {
    logger.debug('Twilio Native AMD: Call answered', { callSid, metadata });
    // Twilio handles detection automatically; we just log
  }

  async finalize(callSid: string): Promise<{
    result: 'human' | 'machine' | 'undecided';
    confidence?: number;
  }> {
    logger.debug('Twilio Native AMD: Finalizing', { callSid });
    // Actual result comes from Twilio webhook
    // This is a placeholder that should never be called directly
    return { result: 'undecided' };
  }
}

/**
 * Hugging Face AMD Strategy (Stub)
 * Proxies audio to external FastAPI microservice for ML-based detection
 */
class HuggingFaceDetector implements AmdDetector {
  private audioChunks: Map<string, Buffer[]> = new Map();
  private readonly serviceUrl: string | undefined;

  constructor() {
    this.serviceUrl = process.env.HF_AMD_SERVICE_URL;
    if (!this.serviceUrl) {
      logger.warn('HF AMD service URL not configured. Will return undecided results.');
    }
  }

  async onAnswered(callSid: string, metadata: Record<string, any>): Promise<void> {
    logger.debug('HF AMD: Call answered, starting audio collection', { callSid });
    this.audioChunks.set(callSid, []);
  }

  async onAudioChunk(callSid: string, audioData: Buffer): Promise<void> {
    const chunks = this.audioChunks.get(callSid) || [];
    chunks.push(audioData);
    this.audioChunks.set(callSid, chunks);
    logger.debug('HF AMD: Audio chunk received', {
      callSid,
      chunkSize: audioData.length,
      totalChunks: chunks.length,
    });
  }

  async finalize(callSid: string): Promise<{
    result: 'human' | 'machine' | 'undecided';
    confidence?: number;
  }> {
    const chunks = this.audioChunks.get(callSid) || [];

    if (!this.serviceUrl) {
      logger.warn('HF AMD: No service URL configured, returning undecided', { callSid });
      this.audioChunks.delete(callSid);
      return { result: 'undecided', confidence: 0 };
    }

    try {
      logger.info('HF AMD: Sending audio to inference service', {
        callSid,
        chunkCount: chunks.length,
        serviceUrl: this.serviceUrl,
      });

      // Combine all audio chunks
      const audioBuffer = Buffer.concat(chunks);

      // Call external FastAPI service
      const response = await fetch(`${this.serviceUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: audioBuffer,
      });

      if (!response.ok) {
        throw new Error(`HF service returned ${response.status}`);
      }

      const data = await response.json();
      logger.info('HF AMD: Detection complete', {
        callSid,
        result: data.result,
        confidence: data.confidence,
      });

      this.audioChunks.delete(callSid);
      return {
        result: data.result || 'undecided',
        confidence: data.confidence,
      };
    } catch (error) {
      logger.error('HF AMD: Detection failed', {
        callSid,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.audioChunks.delete(callSid);
      return { result: 'undecided', confidence: 0 };
    }
  }
}

/**
 * Factory function to create AMD detector based on strategy
 * @param strategy - The AMD strategy to use
 * @returns AMD detector instance
 */
export function createDetector(strategy: Strategy): AmdDetector {
  switch (strategy) {
    case 'twilio':
      return new TwilioNativeDetector();
    case 'huggingface':
      return new HuggingFaceDetector();
    default:
      logger.warn('Unknown strategy, defaulting to Twilio', { strategy });
      return new TwilioNativeDetector();
  }
}
