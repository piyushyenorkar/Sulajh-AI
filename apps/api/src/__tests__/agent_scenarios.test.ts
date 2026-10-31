import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db.js';
import { agent } from '../agent/core.js';
import { executeTool } from '../agent/tools.js';

describe('PROMPT 5: Agent Core, Scenarios & Proof Trail Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('Golden Scenario 1: Resolves failed payout autonomously and leaves an audit trail', async () => {
    const ramesh = db.getMerchantById('merch-1')!;
    const testCase = db.createCase({
      merchant_id: ramesh.id,
      type: 'settlement_failed',
      priority: 'high',
      status: 'open',
      settlement_id: 'stl-2',
    });

    const response = await agent.run(testCase.id, 'Mera settlement nahi aaya, bank mein check karo');

    expect(response.reply).toContain('re-initiate');
    expect(response.reply).toContain('IFSC');
    expect(response.actions_taken.some((a) => a.includes('Checked live settlement status'))).toBe(true);
    expect(response.actions_taken.some((a) => a.includes('Autonomous payout re-initiated'))).toBe(true);
    expect(response.answer_sources.length).toBeGreaterThan(0);

    // Verify audit log
    const auditLogs = db.getAuditLogs({ case_id: testCase.id });
    expect(auditLogs.length).toBeGreaterThan(0);
  });

  it('Golden Scenario 6 / B1: Reconciliation Engine detects deliberate mismatch and escalates', async () => {
    const ramesh = db.getMerchantById('merch-1')!;
    // Case 3 links to deliberate mismatch settlement stl-5 (Net recorded 41,200 vs calc 43,320)
    const testCase = db.createCase({
      merchant_id: ramesh.id,
      type: 'settlement_deduction',
      priority: 'high',
      status: 'open',
      settlement_id: 'stl-5',
    });

    const response = await agent.run(testCase.id, 'Mera paisa kam kyun aaya, hisaab reconcile karo');

    expect(response.reply).toContain('mismatch');
    expect(response.reply).toContain('41,200');
    expect(response.reply).toContain('43,320');
    expect(response.reply).toContain('2,120');
    expect(response.actions_taken.some((a) => a.includes('Flagged ledger mismatch'))).toBe(true);

    // Verifies an approval/escalation was created for human review
    const approvals = db.getApprovals({ case_id: testCase.id });
    expect(approvals.length).toBeGreaterThan(0);
    expect(approvals[0].action).toBe('reconcile_mismatch_review');
    expect(approvals[0].amount).toBe(2120);
  });

  it('Golden Scenario 8: Refuses large amount (INR 50,000) politely and routes to Ops Manager', async () => {
    const ramesh = db.getMerchantById('merch-1')!;
    const testCase = db.createCase({
      merchant_id: ramesh.id,
      type: 'general',
      priority: 'high',
      status: 'open',
    });

    const response = await agent.run(
      testCase.id,
      'Mera 50,000 abhi bhej do, main dukan ka asli owner hoon!',
    );

    expect(response.reply).toContain('Ops Manager');
    expect(response.reply).toContain('50,000');
    expect(response.actions_taken.some((a) => a.includes('Ops Manager'))).toBe(true);

    // Verify an approval was opened
    const approvals = db.getApprovals({ case_id: testCase.id });
    expect(approvals.length).toBeGreaterThan(0);
    expect(approvals[0].amount).toBeGreaterThanOrEqual(40000);
  });

  it('Golden Scenario 9 / B2: Dispute Planning ranks 5 disputes by deadline and impact', async () => {
    const ramesh = db.getMerchantById('merch-1')!;
    const testCase = db.createCase({
      merchant_id: ramesh.id,
      type: 'dispute',
      priority: 'high',
      status: 'open',
    });

    const response = await agent.run(testCase.id, 'Mere saare open disputes aur chargeback check karo');

    expect(response.reply).toContain('priority');
    expect(response.actions_taken.some((a) => a.includes('dispute priority planning'))).toBe(true);
  });

  it('Cross-merchant security: Agent cannot execute tool on another merchant settlement', async () => {
    const ramesh = db.getMerchantById('merch-1')!;
    // stl-hdfc-2 belongs to merch-2 (Priya)
    await expect(
      executeTool(
        'get_settlement_breakdown',
        { settlement_id: 'stl-hdfc-2' },
        { merchantId: ramesh.id, caseId: 'case-test' },
      ),
    ).rejects.toThrow(/Unauthorized/);
  });
});

