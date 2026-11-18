import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectAmountOrAction } from '../services/voice/types.js';
import { GnaniVoiceProvider } from '../services/voice/GnaniVoiceProvider.js';
import { VoiceService } from '../services/voice/VoiceService.js';

describe('Voice Provider & Safety Suite', () => {
  describe('detectAmountOrAction', () => {
    it('detects digit amounts in Hindi and English', () => {
      expect(detectAmountOrAction('mera 50000 kab aayega')).toBe(true);
      expect(detectAmountOrAction('payout of 4821 is delayed')).toBe(true);
      expect(detectAmountOrAction('₹8,500 ka dispute')).toBe(true);
    });

    it('detects currency keywords and sensitive financial actions', () => {
      expect(detectAmountOrAction('paisa turant bhejo')).toBe(true);
      expect(detectAmountOrAction('mera settlement account mein nahi aaya')).toBe(true);
      expect(detectAmountOrAction('customer chargeback review karo')).toBe(true);
      expect(detectAmountOrAction('re-route my failed payout')).toBe(true);
    });

    it('does not trigger amount confirmation for general inquiries', () => {
      expect(detectAmountOrAction('namaste, kaise ho')).toBe(false);
      expect(detectAmountOrAction('bank holiday kab hai')).toBe(false);
      expect(detectAmountOrAction('help needed')).toBe(false);
    });
  });

  describe('GnaniVoiceProvider', () => {
    it('initializes with environment settings', () => {
      const provider = new GnaniVoiceProvider();
      expect(provider.name).toBe('gnani');
      expect(typeof provider.isAvailable()).toBe('boolean');
    });

    it('sanitizes markdown tables and links before speech synthesis', async () => {
      const provider = new GnaniVoiceProvider();
      const sanitize = (provider as any).sanitizeTextForSpeech.bind(provider);

      const markdown = 'Aapka settlement verify ho gaya hai. | Amount | Status | | 500 | Done | [Policy](https://example.com)';
      const clean = sanitize(markdown);
      expect(clean).not.toContain('| Amount | Status |');
      expect(clean).not.toContain('https://example.com');
      expect(clean).toContain('Policy');
    });
  });

  describe('VoiceService Fallback & Caching', () => {
    let service: VoiceService;

    beforeEach(() => {
      service = new VoiceService();
    });

    it('throws clear, informative error if no audio buffer is provided', async () => {
      await expect(service.transcribe(Buffer.alloc(0))).rejects.toThrow('No audio buffer provided');
    });

    it('throws clear, informative error if empty text is passed to synthesize', async () => {
      await expect(service.synthesize('   ')).rejects.toThrow('No text provided');
    });
  });
});
