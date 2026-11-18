import crypto from 'crypto';
import { GnaniVoiceProvider } from './GnaniVoiceProvider.js';
import { SarvamVoiceProvider } from './SarvamVoiceProvider.js';
import { VoiceProvider, TranscribeResult, SynthesizeResult } from './types.js';
import { logger } from '../../lib/logger.js';

interface CachedAudio {
  buffer: Buffer;
  mimeType: string;
  provider: string;
  createdAt: number;
}

export class VoiceService {
  private readonly gnani: GnaniVoiceProvider;
  private readonly sarvam: SarvamVoiceProvider;
  private readonly audioCache = new Map<string, CachedAudio>();
  private readonly MAX_CACHE_ITEMS = 150;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.gnani = new GnaniVoiceProvider();
    this.sarvam = new SarvamVoiceProvider();
  }

  /**
   * Transcribes audio using provider fallback chain: Gnani -> Sarvam.
   */
  public async transcribe(audioBuffer: Buffer, mimeType = 'audio/wav', languageHint?: string): Promise<TranscribeResult> {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio buffer provided for transcription');
    }

    const errors: string[] = [];

    // 1. Try Gnani (Primary)
    if (this.gnani.isAvailable()) {
      try {
        logger.info({ provider: 'gnani' }, 'Attempting speech transcription with Gnani AI');
        const res = await this.gnani.transcribe(audioBuffer, mimeType, languageHint);
        if (res && res.transcript && res.transcript.trim()) {
          logger.info({ provider: 'gnani', transcript: res.transcript }, 'Gnani STT successfully transcribed audio');
          return res;
        } else {
          logger.warn({ provider: 'gnani' }, 'Gnani returned empty transcript, attempting Sarvam fallback');
          errors.push('Gnani STT: Empty transcript returned');
        }
      } catch (err: any) {
        errors.push(`Gnani STT: ${err?.message || err}`);
        logger.warn({ gnaniError: err?.message }, 'Gnani STT failed, falling back to Sarvam');
      }
    } else {
      logger.warn('Gnani STT skipped: GNANI_API_KEY is not set or empty in environment');
      errors.push('Gnani STT: Not configured (missing GNANI_API_KEY)');
    }

    // 2. Try Sarvam (Fallback)
    if (this.sarvam.isAvailable()) {
      try {
        const res = await this.sarvam.transcribe(audioBuffer, mimeType, languageHint);
        if (res && res.transcript && res.transcript.trim()) {
          logger.info({ provider: 'sarvam', transcript: res.transcript }, 'Sarvam STT successfully transcribed audio fallback');
          return res;
        } else {
          errors.push('Sarvam STT: Empty transcript returned');
        }
      } catch (err: any) {
        errors.push(`Sarvam STT: ${err?.message || err}`);
        logger.warn({ err: err?.message }, 'Sarvam STT failed');
      }
    } else {
      errors.push('Sarvam STT: Not configured (missing SARVAM_API_KEY)');
    }

    // Honest failure - no fake canned answers
    throw new Error(`Voice transcription failed across providers. Details: ${errors.join(' | ')}`);
  }

  /**
   * Synthesizes speech using provider fallback chain: Gnani -> Sarvam with in-memory caching.
   */
  public async synthesize(text: string, languageHint?: string, voicePreference?: string): Promise<SynthesizeResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('No text provided for speech synthesis');
    }

    // Check cache
    const cacheKey = this.getCacheKey(trimmed, languageHint, voicePreference);
    const cached = this.audioCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < this.CACHE_TTL_MS) {
      return {
        audioBuffer: cached.buffer,
        mimeType: cached.mimeType,
        provider: cached.provider as 'gnani' | 'sarvam',
      };
    }

    const errors: string[] = [];

    // 1. Try Gnani
    if (this.gnani.isAvailable()) {
      try {
        const result = await this.gnani.synthesize(trimmed, languageHint, voicePreference);
        this.cacheAudio(cacheKey, result.audioBuffer, result.mimeType, 'gnani');
        return result;
      } catch (err: any) {
        errors.push(`Gnani TTS: ${err?.message || err}`);
        logger.warn({ err: err?.message }, 'Gnani TTS failed, trying fallback provider');
      }
    } else {
      errors.push('Gnani TTS: Not configured (missing GNANI_API_KEY)');
    }

    // 2. Try Sarvam
    if (this.sarvam.isAvailable()) {
      try {
        const result = await this.sarvam.synthesize(trimmed, languageHint);
        this.cacheAudio(cacheKey, result.audioBuffer, result.mimeType, 'sarvam');
        return result;
      } catch (err: any) {
        errors.push(`Sarvam TTS: ${err?.message || err}`);
        logger.warn({ err: err?.message }, 'Sarvam TTS failed');
      }
    } else {
      errors.push('Sarvam TTS: Not configured (missing SARVAM_API_KEY)');
    }

    throw new Error(`Voice synthesis failed across providers. Details: ${errors.join(' | ')}`);
  }

  private getCacheKey(text: string, language?: string, voice?: string): string {
    const hash = crypto.createHash('sha256').update(`${text}:${language || 'auto'}:${voice || 'default'}`).digest('hex');
    return hash;
  }

  private cacheAudio(key: string, buffer: Buffer, mimeType: string, provider: string): void {
    if (this.audioCache.size >= this.MAX_CACHE_ITEMS) {
      const oldestKey = this.audioCache.keys().next().value;
      if (oldestKey) this.audioCache.delete(oldestKey);
    }
    this.audioCache.set(key, {
      buffer,
      mimeType,
      provider,
      createdAt: Date.now(),
    });
  }
}

export const voiceService = new VoiceService();
