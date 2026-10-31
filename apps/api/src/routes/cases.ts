import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { paytmGateway } from '../services/paytmGateway.js';

export const casesRouter = Router();

// ─── GET /cases ─────────────────────────────────────────────────────────────
casesRouter.get(
  '/',
  requireAuth,
  requireRole('ops_agent', 'ops_manager', 'admin', 'merchant'),
  (req: Request, res: Response) => {
    const role = req.auth!.role;
    const filter: { merchant_id?: string; status?: any } = {};

    if (role === 'merchant') {
      filter.merchant_id = req.auth!.merchantId;
    } else if (req.query.merchant_id) {
      filter.merchant_id = req.query.merchant_id as string;
    }

    if (req.query.status) {
      filter.status = req.query.status as any;
    }

    const cases = db.getCases(filter).map((c) => ({
      ...c,
      merchant: db.getMerchantById(c.merchant_id),
      approval: db.getApprovals({ case_id: c.id })[0] || null,
    }));
    res.json({ count: cases.length, cases });
  },
);

// ─── GET /cases/:id (Full timeline & decision pack) ──────────────────────────
casesRouter.get(
  '/:id',
  requireAuth,
  requireRole('ops_agent', 'ops_manager', 'admin', 'merchant'),
  (req: Request, res: Response) => {
    const caseId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const caseObj = db.getCaseById(caseId);

    if (!caseObj) {
      res.status(404).json({ error: { message: 'Case not found', code: 'NOT_FOUND' } });
      return;
    }

    // Merchant can only read their own case
    if (req.auth!.role === 'merchant' && caseObj.merchant_id !== req.auth!.merchantId) {
      res.status(403).json({ error: { message: 'Unauthorized access to case', code: 'FORBIDDEN' } });
      return;
    }

    const messages = db.getMessages(caseId);
    const agentSteps = db.getAgentSteps(caseId);
    const approvals = db.getApprovals({ case_id: caseId });
    const answerSources = db.getAnswerSources(caseId);
    const merchant = db.getMerchantById(caseObj.merchant_id);
    const settlement = caseObj.settlement_id ? db.getSettlementById(caseObj.settlement_id) : undefined;
    const dispute = caseObj.dispute_id ? db.getDisputeById(caseObj.dispute_id) : undefined;

    res.json({
      case: {
        ...caseObj,
        merchant,
      },
      merchant,
      settlement,
      dispute,
      approval: approvals[0] || null,
      timeline: {
        messages,
        agent_steps: agentSteps,
        approvals,
        answer_sources: answerSources,
      },
    });
  },
);

// ─── POST /cases/:id/decision (Ops Approval / Rejection with Limit Check) ────
const DecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().min(3, 'A reason is required for every decision'),
});

casesRouter.post(
  '/:id/decision',
  requireAuth,
  requireRole('ops_agent', 'ops_manager', 'admin'),
  async (req: Request, res: Response) => {
    const parseResult = DecisionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
      return;
    }

    const caseId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { decision, reason } = parseResult.data;
    const actorRole = req.auth!.role;
    const actorId = req.auth!.userId;

    const caseObj = db.getCaseById(caseId);
    if (!caseObj) {
      res.status(404).json({ error: { message: 'Case not found', code: 'NOT_FOUND' } });
      return;
    }

    const pendingApprovals = db.getApprovals({ case_id: caseId, decision: 'pending' });
    const activeApproval = pendingApprovals.length > 0 ? pendingApprovals[0] : null;

    if (!activeApproval) {
      res.status(400).json({ error: { message: 'No pending approval found for this case', code: 'NO_PENDING_APPROVAL' } });
      return;
    }

    // Limit check: Ops Agent (L1) has INR 25,000 limit
    const opsAgentLimit = parseFloat(db.getPolicyValue('ops_agent_approval_limit', '25000'));

    if (actorRole === 'ops_agent' && activeApproval.amount > opsAgentLimit) {
      db.logAudit({
        actor_type: 'ops_agent',
        actor_id: actorId,
        case_id: caseId,
        action: 'approval_limit_exceeded_rejected',
        details: {
          attempted_amount: activeApproval.amount,
          agent_limit: opsAgentLimit,
          required_role: 'ops_manager',
        },
      });

      res.status(403).json({
        error: {
          message: `Forbidden: Approval amount ₹${activeApproval.amount.toLocaleString('en-IN')} exceeds Ops Agent limit of ₹${opsAgentLimit.toLocaleString('en-IN')}. Only Ops Manager can approve.`,
          code: 'LIMIT_EXCEEDED',
          requiredRole: 'ops_manager',
        },
      });
      return;
    }

    // Execute decision
    const updatedApproval = db.updateApproval(activeApproval.id, {
      decision,
      reason,
      decided_by: actorId,
      decided_at: new Date().toISOString(),
    });

    if (decision === 'approved') {
      // Execute approved action
      if (caseObj.settlement_id && activeApproval.action === 'reinitiate_payout') {
        await paytmGateway.reinitiatePayout(caseObj.settlement_id);
      }
      if (caseObj.dispute_id && activeApproval.action === 'submit_dispute_defence') {
        const evidence = db.getEvidence(caseObj.dispute_id);
        await paytmGateway.submitDisputeAction(
          caseObj.dispute_id,
          'DEFEND',
          evidence.map((e) => e.id),
        );
      }

      db.updateCase(caseId, {
        status: 'resolved',
        closed_at: new Date().toISOString(),
      });

      // Send confirmation message to merchant
      db.addMessage({
        case_id: caseId,
        sender: 'staff',
        text: `Aapka case hamare ${actorRole === 'ops_manager' ? 'Ops Manager' : 'Ops Executive'} dwara approve kar diya gaya hai. Karwayi poori ho gayi hai. (Reason: ${reason})`,
        lang: 'hinglish',
      });
    } else {
      db.updateCase(caseId, {
        status: 'closed',
        closed_at: new Date().toISOString(),
      });

      db.addMessage({
        case_id: caseId,
        sender: 'staff',
        text: `Aapki request review ke baad decline ki gayi hai. Reason: ${reason}. Kisi aur madad ke liye batayein.`,
        lang: 'hinglish',
      });
    }

    db.logAudit({
      actor_type: actorRole,
      actor_id: actorId,
      case_id: caseId,
      action: `human_decision_${decision}`,
      details: {
        approval_id: activeApproval.id,
        amount: activeApproval.amount,
        reason,
      },
    });

    res.json({
      ok: true,
      case_id: caseId,
      decision,
      approval: updatedApproval,
      case_status: decision === 'approved' ? 'resolved' : 'closed',
    });
  },
);
