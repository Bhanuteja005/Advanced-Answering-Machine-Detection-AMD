/**
 * Twilio Media Streams Handler
 * Real-time bidirectional audio streaming for AMD detection
 */

import { IncomingMessage } from 'http';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface MediaStreamMessage {
  event: 'connected' | 'start' | 'media' | 'stop';
  sequenceNumber?: string;
  streamSid?: string;
  callSid?: string;
  accountSid?: string;
  media?: {
    track: 'inbound' | 'outbound';
    chunk: string;
    timestamp: string;
    payload: string; // base64 encoded audio
  };
  start?: {
    streamSid: string;
    callSid: string;
    customParameters: Record<string, string>;
  };
}

// Store active streams
const activeStreams = new Map<string, AudioStreamProcessor>();

class AudioStreamProcessor {
  private streamSid: string;
  private callSid: string;
  private audioChunks: Buffer[] = [];
  private startTime: number;
  private lastActivity: number;
  private detectionComplete = false;

  constructor(streamSid: string, callSid: string) {
    this.streamSid = streamSid;
    this.callSid = callSid;
    this.startTime = Date.now();
    this.lastActivity = Date.now();
  }

  async processAudioChunk(payload: string, track: 'inbound' | 'outbound') {
    this.lastActivity = Date.now();

    // We're interested in inbound audio (what the person says)
    if (track !== 'inbound') return;

    // Convert base64 payload to buffer
    const audioBuffer = Buffer.from(payload, 'base64');
    this.audioChunks.push(audioBuffer);

    // After collecting ~2-3 seconds of audio, perform AMD detection
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    
    if (elapsedSeconds >= 2.5 && !this.detectionComplete) {
      await this.performAMDDetection();
    }
  }

  private async performAMDDetection() {
    this.detectionComplete = true;

    try {
      // Combine all audio chunks
      const fullAudio = Buffer.concat(this.audioChunks);
      
      logger.info('Performing real-time AMD detection', {
        streamSid: this.streamSid,
        callSid: this.callSid,
        audioLength: fullAudio.length,
        duration: (Date.now() - this.startTime) / 1000,
      });

      // Simple voice activity detection
      const result = await this.analyzeAudio(fullAudio);

      // Update call log with AMD result
      const callLog = await prisma.callLog.findFirst({
        where: { twilioSid: this.callSid },
      });

      if (callLog) {
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            amdResult: result.amdResult,
            confidence: result.confidence,
            status: 'answered',
          },
        });

        logger.info('Real-time AMD detection complete', {
          callSid: this.callSid,
          result: result.amdResult,
          confidence: result.confidence,
        });
      }
    } catch (error) {
      logger.error('AMD detection error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        callSid: this.callSid,
      });
    }
  }

  private async analyzeAudio(audioBuffer: Buffer): Promise<{ amdResult: string; confidence: number }> {
    // Convert audio buffer to analyzable format
    // For production, use actual voice analysis libraries
    
    // Simple heuristic: measure audio characteristics
    const audioLength = audioBuffer.length;
    const energyLevel = this.calculateEnergy(audioBuffer);
    const silenceDuration = this.detectSilence(audioBuffer);

    // Basic rules for AMD
    if (energyLevel > 0.5 && silenceDuration < 500) {
      // High energy, little silence = likely human
      return { amdResult: 'human', confidence: 0.82 };
    } else if (energyLevel < 0.3 || silenceDuration > 1500) {
      // Low energy or long silence = likely machine
      return { amdResult: 'machine', confidence: 0.78 };
    } else {
      // Uncertain
      return { amdResult: 'unknown', confidence: 0.60 };
    }
  }

  private calculateEnergy(buffer: Buffer): number {
    // Calculate RMS energy of audio signal
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
      const sample = buffer.readInt16LE(i);
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / (buffer.length / 2));
    return Math.min(rms / 32768, 1.0); // Normalize to 0-1
  }

  private detectSilence(buffer: Buffer): number {
    // Detect consecutive silence duration in milliseconds
    const threshold = 500; // Silence threshold
    let silenceSamples = 0;
    let maxSilence = 0;
    let currentSilence = 0;

    for (let i = 0; i < buffer.length; i += 2) {
      const sample = Math.abs(buffer.readInt16LE(i));
      if (sample < threshold) {
        currentSilence++;
      } else {
        maxSilence = Math.max(maxSilence, currentSilence);
        currentSilence = 0;
      }
    }

    // Convert samples to milliseconds (8000 Hz sample rate)
    return (maxSilence / 8000) * 1000;
  }

  getStats() {
    return {
      streamSid: this.streamSid,
      callSid: this.callSid,
      chunksReceived: this.audioChunks.length,
      duration: (Date.now() - this.startTime) / 1000,
      detectionComplete: this.detectionComplete,
    };
  }
}

/**
 * Handle WebSocket connection for Media Streams
 */
export function handleMediaStream(ws: any, request: IncomingMessage) {
  logger.info('New Media Stream connection established');

  let currentStream: AudioStreamProcessor | null = null;

  ws.on('message', async (data: string) => {
    try {
      const message: MediaStreamMessage = JSON.parse(data);

      switch (message.event) {
        case 'connected':
          logger.info('Media Stream connected');
          break;

        case 'start':
          if (message.start) {
            const { streamSid, callSid } = message.start;
            logger.info('Media Stream started', { streamSid, callSid });
            
            currentStream = new AudioStreamProcessor(streamSid, callSid);
            activeStreams.set(streamSid, currentStream);
          }
          break;

        case 'media':
          if (message.media && currentStream) {
            await currentStream.processAudioChunk(
              message.media.payload,
              message.media.track
            );
          }
          break;

        case 'stop':
          if (message.streamSid) {
            logger.info('Media Stream stopped', {
              streamSid: message.streamSid,
              stats: currentStream?.getStats(),
            });
            activeStreams.delete(message.streamSid);
            currentStream = null;
          }
          break;
      }
    } catch (error) {
      logger.error('Media Stream error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  ws.on('close', () => {
    logger.info('Media Stream connection closed');
    if (currentStream) {
      const streamSid = currentStream.getStats().streamSid;
      activeStreams.delete(streamSid);
    }
  });

  ws.on('error', (error: Error) => {
    logger.error('Media Stream WebSocket error', { error: error.message });
  });
}

// Export for cleanup
export function getActiveStreams() {
  return Array.from(activeStreams.values()).map(stream => stream.getStats());
}

export function closeAllStreams() {
  activeStreams.clear();
}
