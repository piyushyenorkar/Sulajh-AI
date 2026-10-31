import { ReconciliationResult } from '@sulajh/shared';
import { db } from '../lib/db.js';

export function reconcileSettlement(settlementId: string): ReconciliationResult {
  const settlement = db.getSettlementById(settlementId);
  if (!settlement) {
    throw new Error(`Settlement ${settlementId} not found`);
  }

  const deductions = [
    {
      label: 'Payment Gateway Commission (2%)',
      amount: settlement.commission,
      record_ref: `COMM-${settlement.id.slice(0, 8)}`,
    },
    {
      label: '18% GST on Commission',
      amount: settlement.gst,
      record_ref: `GST-${settlement.id.slice(0, 8)}`,
    },
  ];

  if (settlement.refunds > 0) {
    deductions.push({
      label: 'Customer Refund Deductions',
      amount: settlement.refunds,
      record_ref: `REF-${settlement.id.slice(0, 8)}`,
    });
  }

  if (settlement.chargebacks > 0) {
    deductions.push({
      label: 'Disputed Chargeback Recoveries',
      amount: settlement.chargebacks,
      record_ref: `CB-${settlement.id.slice(0, 8)}`,
    });
  }

  if (settlement.adjustments > 0) {
    deductions.push({
      label: 'Soundbox / POS Monthly Rental & Adjustments',
      amount: settlement.adjustments,
      record_ref: `ADJ-RENTAL-${settlement.id.slice(0, 8)}`,
    });
  }

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const calculatedNet = Math.round((settlement.gross - totalDeductions) * 100) / 100;
  const actualNet = Math.round(settlement.net * 100) / 100;
  const difference = Math.round(Math.abs(calculatedNet - actualNet) * 100) / 100;

  const matched = difference === 0;
  const unmatched_lines: string[] = [];

  if (!matched) {
    unmatched_lines.push(
      `Calculated Net ₹${calculatedNet.toLocaleString('en-IN')} does not match Recorded Net ₹${actualNet.toLocaleString('en-IN')} (Discrepancy: ₹${difference.toLocaleString('en-IN')})`,
    );
  }

  return {
    settlement_id: settlement.id,
    gross: settlement.gross,
    deductions,
    expected_net: calculatedNet,
    actual_net: actualNet,
    matched,
    difference,
    unmatched_lines,
  };
}

