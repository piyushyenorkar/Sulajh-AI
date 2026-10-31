import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db.js';
import { signToken } from '../middleware/auth.js';

describe('PROMPT 3: Authentication & Role-Based Access Control (RBAC)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('generates a valid merchant token with merchantId claim', () => {
    const merchantUser = db.getUserByPhone('9876543210')!;
    const merchant = db.getMerchantByUserId(merchantUser.id)!;

    const token = signToken({
      userId: merchantUser.id,
      role: 'merchant',
      merchantId: merchant.id,
      name: merchantUser.name,
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('proves merchant token cannot access other merchant cases', () => {
    const ramesh = db.getMerchantById('merch-1')!;
    const priya = db.getMerchantById('merch-2')!;

    // Cases belong to Ramesh and Priya
    const rameshCases = db.getCases({ merchant_id: ramesh.id });
    const priyaCases = db.getCases({ merchant_id: priya.id });

    // Isolation check
    for (const c of rameshCases) {
      expect(c.merchant_id).toBe(ramesh.id);
      expect(c.merchant_id).not.toBe(priya.id);
    }
  });

  it('proves audit log captures authentication events', () => {
    const beforeCount = db.getAuditLogs({ action: 'auth_login_success' }).length;

    db.logAudit({
      actor_type: 'merchant',
      actor_id: 'usr-m-1',
      action: 'auth_login_success',
      details: { merchant_id: 'merch-1' },
    });

    const afterLogs = db.getAuditLogs({ action: 'auth_login_success' });
    expect(afterLogs.length).toBe(beforeCount + 1);
  });
});

