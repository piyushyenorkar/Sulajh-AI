import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { agent } from '../agent/core.js';
import { db } from '../lib/db.js';

export const chatRouter = Router();

const ChatRequestSchema = z.object({
  text: z.string().min(1, 'Message text is required'),
  case_id: z.string().optional(),
  lang: z.enum(['hi', 'en', 'hinglish', 'mr']).optional(),
});

chatRouter.post('/', requireAuth, requireRole('merchant'), async (req: Request, res: Response) => {
  const parseResult = ChatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
    return;
  }

  const { text, case_id, lang } = parseResult.data;
  const merchantId = req.auth!.merchantId!;

  let targetCaseId = case_id;

  // If no caseId passed, find or create active case for this merchant
  if (!targetCaseId) {
    const existingCases = db.getCases({ merchant_id: merchantId, status: 'open' });
    if (existingCases.length > 0) {
      targetCaseId = existingCases[0].id;
    } else {
      const newCase = db.createCase({
        merchant_id: merchantId,
        type: 'general',
        priority: 'medium',
        status: 'open',
        assigned_to: 'usr-sys-1',
        summary: `Merchant inquiry: "${text.slice(0, 60)}..."`,
      });
      targetCaseId = newCase.id;
    }
  }

  const caseObj = db.getCaseById(targetCaseId);
  if (!caseObj || caseObj.merchant_id !== merchantId) {
    res.status(403).json({ error: { message: 'Case not found or unauthorized', code: 'FORBIDDEN' } });
    return;
  }

  try {
    const result = await agent.run(targetCaseId, text, lang);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || 'Agent error', code: 'AGENT_ERROR' } });
  }
});

