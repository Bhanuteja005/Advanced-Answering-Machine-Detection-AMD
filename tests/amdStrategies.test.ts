/**
 * Tests for AMD strategy factory
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDetector } from '@/lib/amdStrategies';

describe('AMD Strategy Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create Twilio Native detector', () => {
    const detector = createDetector('twilio');
    expect(detector).toBeDefined();
    expect(typeof detector.onAnswered).toBe('function');
    expect(typeof detector.finalize).toBe('function');
  });

  it('should create Hugging Face detector', () => {
    const detector = createDetector('huggingface');
    expect(detector).toBeDefined();
    expect(typeof detector.onAnswered).toBe('function');
    expect(typeof detector.onAudioChunk).toBe('function');
    expect(typeof detector.finalize).toBe('function');
  });

  it('should handle Twilio Native onAnswered', async () => {
    const detector = createDetector('twilio');
    await expect(
      detector.onAnswered('CAtest123', { status: 'answered' })
    ).resolves.not.toThrow();
  });

  it('should handle Hugging Face onAnswered', async () => {
    const detector = createDetector('huggingface');
    await expect(
      detector.onAnswered('CAtest123', { status: 'answered' })
    ).resolves.not.toThrow();
  });

  it('should handle Hugging Face onAudioChunk', async () => {
    const detector = createDetector('huggingface');
    const audioBuffer = Buffer.from('test-audio-data');
    
    await detector.onAnswered('CAtest123', {});
    
    if (detector.onAudioChunk) {
      await expect(
        detector.onAudioChunk('CAtest123', audioBuffer)
      ).resolves.not.toThrow();
    }
  });

  it('should return undecided when HF service is not configured', async () => {
    delete process.env.HF_AMD_SERVICE_URL;
    
    const detector = createDetector('huggingface');
    await detector.onAnswered('CAtest123', {});
    
    const result = await detector.finalize('CAtest123');
    
    expect(result.result).toBe('undecided');
    expect(result.confidence).toBe(0);
  });

  it('should handle HF service errors gracefully', async () => {
    process.env.HF_AMD_SERVICE_URL = 'http://invalid-url.local';
    
    const detector = createDetector('huggingface');
    await detector.onAnswered('CAtest123', {});
    
    const result = await detector.finalize('CAtest123');
    
    expect(result.result).toBe('undecided');
    expect(result.confidence).toBe(0);
  });
});
