import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { agent } from '../agent/core.js';

export const mockEventsRouter = Router();

const MockEventSchema = z.object({
  type: z.enum([
    'settlement_failed',
    'settlement_delayed',
    'dispute_opened',
    'dispute_due_soon',
    'bank_outage',
    'reset_demo',
  ]),
  merchant_id: z.string().optional(),
});

mockEventsRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = MockEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: { message: parseResult.error.errors[0].message, code: 'INVALID_INPUT' } });
    return;
  }

  const { type, merchant_id } = parseResult.data;
  const targetMerchantId = merchant_id || 'merch-1'; // Default to Ramesh
  const merchant = db.getMerchantById(targetMerchantId);

  if (type === 'reset_demo') {
    db.reset();
    res.json({ ok: true, message: 'All demo seed data has been reset successfully.' });
    return;
  }

  // ─── 1. SETTLEMENT FAILED PROACTIVE EVENT ─────────────────────────────────
  if (type === 'settlement_failed') {
    const newCase = db.createCase({
      merchant_id: targetMerchantId,
      type: 'settlement_failed',
      priority: 'high',
      status: 'open',
      assigned_to: 'usr-sys-1',
      settlement_id: 'stl-2',
      summary: 'Proactive Alert: Settlement failed due to bank IFSC code rejection',
    });

    // Proactive AI Teammate reaches out to merchant first without being asked!
    const initialText = 'System Event: Settlement failure detected from NPCI bank clearing';
    const agentResponse = await agent.run(newCase.id, initialText);

    res.json({
      ok: true,
      event: 'settlement_failed',
      case_id: newCase.id,
      agent_proactive_reply: agentResponse.reply,
      actions_taken: agentResponse.actions_taken,
    });
    return;
  }

  // ─── 2. SETTLEMENT DELAYED (> 120 MINS) ───────────────────────────────────
  if (type === 'settlement_delayed') {
    const newCase = db.createCase({
      merchant_id: targetMerchantId,
      type: 'settlement_delayed',
      priority: 'medium',
      status: 'open',
      assigned_to: 'usr-sys-1',
      settlement_id: 'stl-3',
      summary: 'Proactive Alert: Settlement pending past 120 minutes window',
    });

    const initialText = 'System Event: Settlement delayed past standard SLA window';
    const agentResponse = await agent.run(newCase.id, initialText);

    res.json({
      ok: true,
      event: 'settlement_delayed',
      case_id: newCase.id,
      agent_proactive_reply: agentResponse.reply,
    });
    return;
  }

  // ─── 3. DISPUTE DUE SOON (2 DAYS REMAINING) ────────────────────────────────
  if (type === 'dispute_due_soon') {
    const newCase = db.createCase({
      merchant_id: targetMerchantId,
      type: 'dispute',
      priority: 'high',
      status: 'open',
      assigned_to: 'usr-sys-1',
      dispute_id: 'dsp-1',
      summary: 'Proactive Alert: Chargeback of ₹8,500 due in 48 hours',
    });

    const initialText = 'System Event: Dispute deadline approaching in 48 hours';
    const agentResponse = await agent.run(newCase.id, initialText);

    res.json({
      ok: true,
      event: 'dispute_due_soon',
      case_id: newCase.id,
      agent_proactive_reply: agentResponse.reply,
    });
    return;
  }

  // ─── 4. BANK OUTAGE: 10 FAILED PAYOUTS -> 1 SINGLE INCIDENT (Prompt 11 / B3)
  if (type === 'bank_outage') {
    const bank = 'HDFC Bank';
    const cause = 'HDFC Bank core banking system timeout (CBS 91: Gateway Down)';

    // Threshold check (5 failures in 60 mins -> opens ONE incident)
    const incident = db.createIncident({
      cause,
      bank,
      status: 'open',
      merchant_count: 10,
    });

    const createdCases: string[] = [];

    // Link 10 merchant cases to the single incident
    for (let i = 1; i <= 10; i++) {
      const mId = `merch-${(i % 8) + 1}`;
      const c = db.createCase({
        merchant_id: mId,
        type: 'settlement_failed',
        priority: 'high',
        status: 'open',
        incident_id: incident.id,
        settlement_id: `stl-hdfc-${i}`,
        summary: `HDFC Bank Outage: Payout held under Incident #${incident.id.slice(0, 8)}`,
      });

      // Broadcast single consistent proactive message to affected merchant
      db.addMessage({
        case_id: c.id,
        sender: 'agent',
        text: `HDFC Bank ke server mein temporary takneeki dikkat (CBS-91) aayi hai, jisse kai merchants ke payouts rukh gaye hain. Humne isko Incident #${incident.id.slice(0, 8)} ke tehat track kar liya hai. Jaise hi bank switch live hoga, aapka payout bina kisi katauti ke credit kar diya jayega.`,
        lang: 'hinglish',
      });

      createdCases.push(c.id);
    }

    db.logAudit({
      actor_type: 'system_agent',
      actor_id: 'usr-sys-1',
      action: 'incident_auto_created',
      details: {
        incident_id: incident.id,
        bank,
        affected_merchants: 10,
        linked_case_ids: createdCases,
      },
    });

    res.json({
      ok: true,
      event: 'bank_outage',
      incident_id: incident.id,
      incident_status: incident.status,
      affected_merchants: 10,
      linked_case_ids: createdCases,
      message: '1 incident opened successfully instead of 10 isolated tickets.',
    });
    return;
  }

  res.json({ ok: true, message: 'Event received' });
});

