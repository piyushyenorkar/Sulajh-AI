import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../lib/db.js';

export const auditRouter = Router();

// ─── GET /audit (JSON List) ──────────────────────────────────────────────────
auditRouter.get('/', requireAuth, requireRole('ops_manager', 'admin'), (req: Request, res: Response) => {
  const caseId = req.query.case_id as string | undefined;
  const actorId = req.query.actor_id as string | undefined;
  const action = req.query.action as string | undefined;

  const logs = db.getAuditLogs({ case_id: caseId, actor_id: actorId, action });
  res.json({ count: logs.length, logs });
});

// ─── GET /audit/export (CSV Download - Admin Only) ───────────────────────────
auditRouter.get('/export', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const logs = db.getAuditLogs();

  // Generate CSV format
  const headers = ['id', 'timestamp', 'actor_type', 'actor_id', 'case_id', 'action', 'details'];
  const rows = logs.map((l) => [
    l.id,
    l.ts,
    l.actor_type,
    l.actor_id,
    l.case_id || '',
    l.action,
    JSON.stringify(l.details).replace(/"/g, '""'), // escape quotes for CSV
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sulajh-audit-log.csv"');
  res.send(csvContent);
});

