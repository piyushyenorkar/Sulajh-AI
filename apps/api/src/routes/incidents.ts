import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { paytmGateway } from '../services/paytmGateway.js';
import { policyEngine } from '../services/policyEngine.js';

export const incidentsRouter = Router();

// ─── GET /incidents ─────────────────────────────────────────────────────────
incidentsRouter.get(
  '/',
  requireAuth,
  requireRole('ops_agent', 'ops_manager', 'admin'),
  (_req: Request, res: Response) => {
    const incidents = db.getIncidents();
    res.json({ count: incidents.length, incidents });
  },
);

// ─── GET /incidents/:id ─────────────────────────────────────────────────────
incidentsRouter.get(
  '/:id',
  requireAuth,
  requireRole('ops_agent', 'ops_manager', 'admin'),
  (req: Request, res: Response) => {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const incident = db.getIncidentById(id);
    if (!incident) {
      res.status(404).json({ error: { message: 'Incident not found', code: 'NOT_FOUND' } });
      return;
    }

    // Get linked cases
    const allCases = db.getCases();
    const linkedCases = allCases.filter((c) => c.incident_id === incident.id);

    res.json({
      incident,
      linked_cases_count: linkedCases.length,
      cases: linkedCases,
    });
  },
);

// ─── POST /incidents/:id/bulk-retry ─────────────────────────────────────────
incidentsRouter.post(
  '/:id/bulk-retry',
  requireAuth,
  requireRole('ops_manager', 'admin'),
  async (req: Request, res: Response) => {
    const incidentId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const incident = db.getIncidentById(incidentId);

    if (!incident) {
      res.status(404).json({ error: { message: 'Incident not found', code: 'NOT_FOUND' } });
      return;
    }

    const allCases = db.getCases();
    const linkedCases = allCases.filter((c) => c.incident_id === incident.id);

    const results: Array<{ case_id: string; settlement_id?: string; status: string; reason?: string }> = [];

    for (const c of linkedCases) {
      if (!c.settlement_id) continue;
      const stl = db.getSettlementById(c.settlement_id);
      if (!stl) continue;

      // Money Safety check per payout, even during bulk retry (Prompt 11 / B3 requirement)
      const policyCheck = policyEngine.evaluate({
        actor: req.auth!.role,
        action: 'reinitiate_payout',
        amount: stl.net,
        merchantId: c.merchant_id,
        caseId: c.id,
      });

      if (policyCheck.result === 'allow') {
        await paytmGateway.reinitiatePayout(stl.id);
        db.updateCase(c.id, { status: 'resolved', closed_at: new Date().toISOString() });
        db.addMessage({
          case_id: c.id,
          sender: 'staff',
          text: `Bank outage clear hone ke baad aapka payout (₹${stl.net.toLocaleString('en-IN')}) successfully re-initiate kar diya gaya hai.`,
          lang: 'hinglish',
        });
        results.push({ case_id: c.id, settlement_id: stl.id, status: 'reinitiated' });
      } else {
        results.push({ case_id: c.id, settlement_id: stl.id, status: 'held_for_review', reason: policyCheck.reason });
      }
    }

    // Mark incident resolved
    db.updateIncident(incidentId, {
      status: 'resolved',
      closed_at: new Date().toISOString(),
    });

    db.logAudit({
      actor_type: req.auth!.role,
      actor_id: req.auth!.userId,
      action: 'incident_bulk_retry_executed',
      details: { incident_id: incidentId, retried_count: results.length },
    });

    res.json({
      ok: true,
      incident_id: incidentId,
      retried_count: results.length,
      results,
    });
  },
);
