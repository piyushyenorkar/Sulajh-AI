import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';

export const policiesRouter = Router();

// ─── GET /policies ──────────────────────────────────────────────────────────
policiesRouter.get('/', requireAuth, requireRole('ops_manager', 'admin'), (_req: Request, res: Response) => {
  const policies = db.getPolicies();
  res.json({ count: policies.length, policies });
});

// ─── PUT /policies (Versioned Policy Edit - Admin Only) ───────────────────────
const PolicyUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

policiesRouter.put('/', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const parseResult = PolicyUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
    return;
  }

  const { key, value } = parseResult.data;
  const adminId = req.auth!.userId;

  const newPolicy = db.updatePolicy(key, value, adminId);
  res.json({ ok: true, policy: newPolicy });
});

// ─── GET /policy-suggestions ────────────────────────────────────────────────
policiesRouter.get('/suggestions', requireAuth, requireRole('ops_manager', 'admin'), (_req: Request, res: Response) => {
  const suggestions = db.getPolicySuggestions();
  res.json({ count: suggestions.length, suggestions });
});

// ─── POST /policy-suggestions/:id/action (Accept or Dismiss) ─────────────────
const SuggestionActionSchema = z.object({
  action: z.enum(['accept', 'dismiss']),
});

policiesRouter.post('/suggestions/:id/action', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const parseResult = SuggestionActionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
    return;
  }

  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { action } = parseResult.data;
  const status = action === 'accept' ? 'accepted' : 'dismissed';

  const updated = db.updatePolicySuggestionStatus(id, status);

  // If accepted, update the corresponding policy
  if (action === 'accept' && updated.rule_key === 'agent_approval_limit') {
    db.updatePolicy('agent_approval_limit', '7500', req.auth!.userId);
  }

  db.logAudit({
    actor_type: 'admin',
    actor_id: req.auth!.userId,
    action: `policy_suggestion_${action}`,
    details: { suggestion_id: id, status },
  });

  res.json({ ok: true, suggestion: updated });
});
