import { VoiceProvider, TranscribeResult, SynthesizeResult, detectAmountOrAction } from './types.js';
import { logger } from '../../lib/logger.js';

export class GnaniVoiceProvider implements VoiceProvider {
  public readonly name = 'gnani';

  private get apiKey(): string {
    return (process.env.GNANI_API_KEY || '').trim();
  }

  private get baseUrl(): string {
    return (process.env.GNANI_BASE_URL || 'https://api.vachana.ai').replace(/\/+$/, '');
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey.length > 0);
  }

  /**
   * Transcribes speech audio using Gnani Vachana STT v3.
   */
  public async transcribe(audioBuffer: Buffer, mimeType = 'audio/wav', languageHint?: string): Promise<TranscribeResult> {
    if (!this.isAvailable()) {
      throw new Error('GNANI_API_KEY is not configured');
    }

    const languageCode = this.mapLanguageCode(languageHint, true);
    logger.info({ provider: 'gnani', languageCode, bufferSize: audioBuffer.length }, 'Invoking Gnani STT');

    const formData = new FormData();
    const uint8 = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8], { type: mimeType });
    formData.append('audio_file', blob, 'recording.wav');
    formData.append('model', 'prisma-v3.0');
    formData.append('language_code', languageCode);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseUrl}/stt/v3`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': this.apiKey,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gnani STT failed [${response.status}]: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const transcript = (data.transcript || '').trim();
      const detectedLanguage = data.detected_language_code || languageHint || 'hi-IN';

      return {
        transcript,
        detected_language: detectedLanguage,
        confidence: data.confidence,
        provider: 'gnani',
        needs_amount_confirmation: detectAmountOrAction(transcript),
      };
    } catch (err: any) {
      clearTimeout(timeout);
      logger.warn({ err: err?.message }, 'Gnani STT execution failed');
      throw err;
    }
  }

  /**
   * Generates natural speech using Gnani Timbre TTS.
   */
  public async synthesize(text: string, languageHint?: string, voicePreference?: string): Promise<SynthesizeResult> {
    if (!this.isAvailable()) {
      throw new Error('GNANI_API_KEY is not configured');
    }

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) {
      throw new Error('No speakable text provided for synthesis');
    }

    const voice = voicePreference || 'Shivani';
    const langCode = this.mapLanguageCode(languageHint, false);
    logger.info({ provider: 'gnani', voice, langCode, textLength: cleanText.length }, 'Invoking Gnani TTS');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/tts/inference`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'timbre-v3.0',
          text: cleanText,
          voice,
          language: langCode,
          audio_config: {
            container: 'wav',
            encoding: 'linear_pcm',
            sample_rate: 16000,
            num_channels: 1,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gnani TTS failed [${response.status}]: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      return {
        audioBuffer,
        mimeType: 'audio/wav',
        provider: 'gnani',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      logger.warn({ err: err?.message }, 'Gnani TTS execution failed');
      throw err;
    }
  }

  private mapLanguageCode(hint?: string, isStt = false): string {
    if (!hint) return isStt ? 'indic-auto' : 'hi-IN';
    const clean = hint.toLowerCase();
    if (clean === 'mr' || clean.startsWith('mr-')) return 'mr-IN';
    if (clean === 'en' || clean.startsWith('en-')) return 'en-IN';
    if (clean === 'hi' || clean === 'hinglish' || clean.startsWith('hi-')) return 'hi-IN';
    return isStt ? 'indic-auto' : 'hi-IN';
  }

  /**
   * Strips out raw markdown tables, URLs, json and symbols to produce clean spoken text.
   */
  private sanitizeTextForSpeech(text: string): string {
    return text
      .replace(/\|[^\n]+\|/g, '') // strip markdown tables
      .replace(/```[\s\S]*?```/g, '') // strip code blocks
      .replace(/`([^`]+)`/g, '$1') // unquote inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // strip links, keep label
      .replace(/[#*_~>]/g, '') // strip markdown markers
      .replace(/\s+/g, ' ')
      .trim();
  }
}
