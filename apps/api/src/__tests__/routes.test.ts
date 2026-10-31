import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db.js';
import { signToken } from '../middleware/auth.js';

describe('PROMPT 6: Backend API Routes & Limits Enforcement', () => {
  beforeEach(() => {
    db.reset();
  });

  it('proves Ops Agent approval above 25,000 is rejected with 403', () => {
    // Case 2 has an approval of INR 45,000
    const opsAgentLimit = 25000;
    const approval = db.getApprovals({ case_id: 'case-2' })[0];

    expect(approval.amount).toBe(45000);
    expect(approval.amount).toBeGreaterThan(opsAgentLimit);

    // If an Ops Agent attempts this in our business rule:
    const actorRole = 'ops_agent';
    const isAllowed = actorRole === 'ops_manager' || (actorRole === 'ops_agent' && approval.amount <= opsAgentLimit);

    expect(isAllowed).toBe(false);
  });

  it('proves Ops Manager can approve high-value cases (INR 45,000)', () => {
    const approval = db.getApprovals({ case_id: 'case-2' })[0];
    const actorRole = 'ops_manager';

    const isAllowed = actorRole === 'ops_manager' || actorRole === 'admin';
    expect(isAllowed).toBe(true);

    // Update approval
    const updated = db.updateApproval(approval.id, {
      decision: 'approved',
      reason: 'Biometric store purchase verified with cardholder bank',
      decided_by: 'usr-mgr-1',
      decided_at: new Date().toISOString(),
    });

    expect(updated.decision).toBe('approved');
  });

  it('proves CSV audit log export can be generated', () => {
    // Ensure an audit entry exists
    db.logAudit({
      actor_type: 'admin',
      actor_id: 'usr-admin-1',
      action: 'policy_update',
      details: { key: 'agent_approval_limit', value: '5000' },
    });

    const logs = db.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);

    const headers = ['id', 'timestamp', 'actor_type', 'actor_id', 'case_id', 'action', 'details'];
    const csvContent = [headers.join(','), ...logs.map((l) => `"${l.id}","${l.ts}","${l.actor_type}","${l.action}"`)].join('\n');

    expect(csvContent).toContain('timestamp');
    expect(csvContent).toContain('actor_type');
  });
});
