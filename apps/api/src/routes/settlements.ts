import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { paytmGateway } from '../services/paytmGateway.js';

export const settlementsRouter = Router();

// ─── GET /merchant/settlements ──────────────────────────────────────────────
settlementsRouter.get(
  '/',
  requireAuth,
  requireRole('merchant', 'ops_agent', 'ops_manager', 'admin'),
  (req: Request, res: Response) => {
    const role = req.auth!.role;
    const merchantId = role === 'merchant' ? req.auth!.merchantId! : (req.query.merchant_id as string);

    if (!merchantId) {
      res.status(400).json({ error: { message: 'merchant_id required', code: 'INVALID_INPUT' } });
      return;
    }

    const settlements = db.getSettlements(merchantId);
    res.json({
      count: settlements.length,
      settlements: settlements.map((s) => ({
        ...s,
        is_simulated: true,
      })),
    });
  },
);

// ─── GET /merchant/settlements/:id ──────────────────────────────────────────
settlementsRouter.get(
  '/:id',
  requireAuth,
  requireRole('merchant', 'ops_agent', 'ops_manager', 'admin'),
  async (req: Request, res: Response) => {
    const settlementId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const detail = await paytmGateway.getSettlementDetail(settlementId);

    if (!detail) {
      res.status(404).json({ error: { message: 'Settlement not found', code: 'NOT_FOUND' } });
      return;
    }

    // Role check: Merchant can only read their own settlement
    if (req.auth!.role === 'merchant' && detail.merchant_id !== req.auth!.merchantId) {
      res.status(403).json({ error: { message: 'Unauthorized access to settlement', code: 'FORBIDDEN' } });
      return;
    }

    res.json(detail);
  },
);
