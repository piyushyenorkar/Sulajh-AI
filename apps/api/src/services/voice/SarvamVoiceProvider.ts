import { VoiceProvider, TranscribeResult, SynthesizeResult, detectAmountOrAction } from './types.js';
import { logger } from '../../lib/logger.js';

export class SarvamVoiceProvider implements VoiceProvider {
  public readonly name = 'sarvam';

  private get apiKey(): string {
    return (process.env.SARVAM_API_KEY || '').trim();
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey.length > 0);
  }

  public async transcribe(audioBuffer: Buffer, mimeType = 'audio/wav', languageHint?: string): Promise<TranscribeResult> {
    if (!this.isAvailable()) {
      throw new Error('SARVAM_API_KEY is not configured');
    }

    const languageCode = languageHint === 'mr' ? 'mr-IN' : languageHint === 'en' ? 'en-IN' : 'hi-IN';
    logger.info({ provider: 'sarvam', languageCode, bufferSize: audioBuffer.length }, 'Invoking Sarvam STT fallback');

    const formData = new FormData();
    const uint8 = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'saaras:v3');
    formData.append('language_code', languageCode);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam STT failed [${response.status}]: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const transcript = (data.transcript || '').trim();

      return {
        transcript,
        detected_language: data.language_code || languageCode,
        provider: 'sarvam',
        needs_amount_confirmation: detectAmountOrAction(transcript),
      };
    } catch (err: any) {
      clearTimeout(timeout);
      logger.warn({ err: err?.message }, 'Sarvam STT fallback failed');
      throw err;
    }
  }

  public async synthesize(text: string, languageHint?: string): Promise<SynthesizeResult> {
    if (!this.isAvailable()) {
      throw new Error('SARVAM_API_KEY is not configured');
    }

    const targetLanguage = languageHint === 'mr' ? 'mr-IN' : languageHint === 'en' ? 'en-IN' : 'hi-IN';
    logger.info({ provider: 'sarvam', targetLanguage, textLength: text.length }, 'Invoking Sarvam TTS fallback');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: targetLanguage,
          speaker: 'meera',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam TTS failed [${response.status}]: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const base64Audio = data.audios?.[0];
      if (!base64Audio) {
        throw new Error('Sarvam TTS returned empty audio payload');
      }

      const audioBuffer = Buffer.from(base64Audio, 'base64');

      return {
        audioBuffer,
        mimeType: 'audio/wav',
        provider: 'sarvam',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      logger.warn({ err: err?.message }, 'Sarvam TTS fallback failed');
      throw err;
    }
  }
}
