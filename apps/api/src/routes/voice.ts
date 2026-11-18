import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { voiceService } from '../services/voice/VoiceService.js';
import { logger } from '../lib/logger.js';

export const voiceRouter = Router();

/**
 * POST /voice/transcribe
 * Transcribes audio from browser microphone.
 * Uses Gnani as primary STT engine with Sarvam as fallback.
 */
voiceRouter.post('/transcribe', requireAuth, async (req: Request, res: Response) => {
  const { audio_base64, audio_mime = 'audio/wav', language_hint } = req.body;

  if (!audio_base64) {
    res.status(400).json({
      ok: false,
      error: 'audio_base64 is required. Please provide base64-encoded audio recorded from microphone.',
    });
    return;
  }

  try {
    const audioBuffer = Buffer.from(audio_base64, 'base64');
    if (audioBuffer.length < 500) {
      res.status(400).json({
        ok: false,
        error: 'Audio sample is too short or empty. Please speak clearly for at least 1 second.',
      });
      return;
    }

    const result = await voiceService.transcribe(audioBuffer, audio_mime, language_hint);

    res.json({
      ok: true,
      transcript: result.transcript,
      detected_language: result.detected_language,
      confidence: result.confidence,
      provider: result.provider,
      needs_amount_confirmation: result.needs_amount_confirmation,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, 'Failed to transcribe audio');
    res.status(502).json({
      ok: false,
      error: 'Unable to transcribe audio through speech providers',
      details: err?.message,
    });
  }
});

/**
 * POST /voice/synthesize
 * Converts response text to speech audio using Gnani TTS (with Sarvam fallback).
 * Returns base64 audio and metadata.
 */
voiceRouter.post('/synthesize', requireAuth, async (req: Request, res: Response) => {
  const { text, language, voice } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({
      ok: false,
      error: 'text is required for speech synthesis',
    });
    return;
  }

  try {
    const result = await voiceService.synthesize(text, language, voice);

    res.json({
      ok: true,
      audio_base64: result.audioBuffer.toString('base64'),
      mime_type: result.mimeType,
      provider: result.provider,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, 'Failed to synthesize speech');
    res.status(502).json({
      ok: false,
      error: 'Unable to synthesize speech through voice providers',
      details: err?.message,
    });
  }
});

/**
 * GET /voice/speak
 * Direct audio streaming endpoint for browser audio players.
 */
voiceRouter.get('/speak', async (req: Request, res: Response) => {
  const text = req.query.text as string;
  const language = req.query.lang as string;
  const voice = req.query.voice as string;

  if (!text || !text.trim()) {
    res.status(400).send('text query parameter is required');
    return;
  }

  try {
    const result = await voiceService.synthesize(text, language, voice);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Length', result.audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(result.audioBuffer);
  } catch (err: any) {
    logger.error({ err: err?.message }, 'Failed to stream audio speech');
    res.status(502).send('Speech generation failed');
  }
});
