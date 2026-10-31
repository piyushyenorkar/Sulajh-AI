import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db.js';

describe('PROMPT 2: Database Schema, RLS, & Security Checks', () => {
  beforeEach(() => {
    db.reset();
  });

  it('proves that seed is idempotent and runs twice without duplicating primary keys or core records', () => {
    const initialMerchants = db.getMerchants().length;
    const initialSettlements = db.getSettlements().length;

    db.reset();

    expect(db.getMerchants().length).toBe(initialMerchants);
    expect(db.getSettlements().length).toBe(initialSettlements);
    expect(initialMerchants).toBe(8);
    expect(initialSettlements).toBeGreaterThanOrEqual(15);
  });

  it('proves audit_log is append-only: UPDATE and DELETE are strictly forbidden', () => {
    // 1. Add an audit log entry
    const entry = db.logAudit({
      actor_type: 'merchant',
      actor_id: 'usr-m-1',
      case_id: 'case-1',
      action: 'view_settlement',
      details: { settlement_id: 'stl-1' },
    });

    expect(entry.id).toBeDefined();

    // 2. Attempting modification MUST throw
    expect(() => {
      db.attemptModifyAuditLog();
    }).toThrow(/audit_log is append-only/);
  });

  it('proves merchant A cannot read merchant B settlements (Row-level isolation)', () => {
    const rameshMerchantId = 'merch-1';
    const priyaMerchantId = 'merch-2';

    // Fetch settlements scoped by merchant_id
    const rameshSettlements = db.getSettlements(rameshMerchantId);
    const priyaSettlements = db.getSettlements(priyaMerchantId);

    expect(rameshSettlements.length).toBeGreaterThan(0);
    expect(priyaSettlements.length).toBeGreaterThan(0);

    // Ramesh's settlements must not include any of Priya's settlements
    const hasPriyaSettlementInRamesh = rameshSettlements.some((s) => s.merchant_id === priyaMerchantId);
    expect(hasPriyaSettlementInRamesh).toBe(false);

    // Priya's settlements must not include any of Ramesh's settlements
    const hasRameshSettlementInPriya = priyaSettlements.some((s) => s.merchant_id === rameshMerchantId);
    expect(hasRameshSettlementInPriya).toBe(false);
  });

  it('contains the deliberate mismatch settlement for the reconciliation engine', () => {
    const mismatchStl = db.getSettlementById('stl-5');
    expect(mismatchStl).toBeDefined();
    if (!mismatchStl) return;

    // Gross: 50000, Commission: 1000, GST: 180, Refunds: 2500, Chargebacks: 3000
    // Expected = 43320, but recorded is 41200
    const expected = mismatchStl.gross - mismatchStl.commission - mismatchStl.gst - mismatchStl.refunds - mismatchStl.chargebacks;
    expect(expected).toBe(43320);
    expect(mismatchStl.net).toBe(41200);
    expect(expected).not.toBe(mismatchStl.net);
  });
});

