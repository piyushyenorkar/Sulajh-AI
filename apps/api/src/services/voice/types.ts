export interface TranscribeResult {
  transcript: string;
  detected_language: string;
  confidence?: number;
  provider: 'gnani' | 'sarvam';
  needs_amount_confirmation: boolean;
}

export interface SynthesizeResult {
  audioBuffer: Buffer;
  mimeType: string;
  provider: 'gnani' | 'sarvam';
}

export interface VoiceProvider {
  name: string;
  transcribe(audioBuffer: Buffer, mimeType: string, languageHint?: string): Promise<TranscribeResult>;
  synthesize(text: string, language?: string, voice?: string): Promise<SynthesizeResult>;
}

/**
 * Checks if a transcribed sentence contains monetary amounts, digits, or payout operations
 * that require mandatory explicit confirmation before moving forward.
 */
export function detectAmountOrAction(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  // Digits check (e.g. 500, 4821, 50,000)
  if (/\d+/.test(lower)) return true;

  // Amount keywords in English, Hindi, Hinglish
  const amountKeywords = [
    '₹', 'rs', 'rupee', 'rupaye', 'rupya', 'paisa', 'paise',
    'hazar', 'hazaar', 'thousand', 'lakh', 'crore', 'sau', 'hundred'
  ];
  if (amountKeywords.some((kw) => lower.includes(kw))) return true;

  // Sensitive payout/settlement transfer actions
  const actionKeywords = [
    'payout', 'settlement', 're-route', 'bhejo', 'transfer',
    'refund', 'hold', 'dispute', 'chargeback', 'account'
  ];
  return actionKeywords.some((kw) => lower.includes(kw));
}
