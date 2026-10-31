import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';

export const evidenceRouter = Router();

const EvidenceUploadSchema = z.object({
  dispute_id: z.string().min(1),
  kind: z.string().default('delivery_proof'),
  file_name: z.string().default('proof_document.pdf'),
});

evidenceRouter.post(
  '/',
  requireAuth,
  requireRole('merchant', 'ops_agent', 'ops_manager', 'admin'),
  (req: Request, res: Response) => {
    const parseResult = EvidenceUploadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
      return;
    }

    const { dispute_id, kind, file_name } = parseResult.data;
    const dispute = db.getDisputeById(dispute_id);

    if (!dispute) {
      res.status(404).json({ error: { message: 'Dispute not found', code: 'NOT_FOUND' } });
      return;
    }

    // Role check
    if (req.auth!.role === 'merchant' && dispute.merchant_id !== req.auth!.merchantId) {
      res.status(403).json({ error: { message: 'Unauthorized dispute access', code: 'FORBIDDEN' } });
      return;
    }

    // Simulated cloud storage upload URL
    const fileUrl = `https://storage.paytm.com/evidence/${dispute_id}_${Date.now()}_${encodeURIComponent(file_name)}`;

    const evidence = db.addEvidence({
      dispute_id,
      file_url: fileUrl,
      kind,
      uploaded_by: req.auth!.userId,
    });

    // Automatically update dispute status if currently NEW
    if (dispute.status === 'NEW') {
      db.updateDispute(dispute.id, { status: 'POD_UPLOAD' });
    }

    db.logAudit({
      actor_type: req.auth!.role,
      actor_id: req.auth!.userId,
      action: 'evidence_uploaded',
      details: { dispute_id, kind, fileUrl },
    });

    res.json({
      ok: true,
      evidence,
      message: 'Proof of delivery uploaded successfully.',
    });
  },
);

