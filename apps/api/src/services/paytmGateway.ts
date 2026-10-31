/**
 * Simulated. Replace each function with the real Paytm API call.
 *
 * This module conforms to the official Paytm Settlement and Dispute API contracts.
 * In production, these methods will map 1:1 to:
 * - Paytm Settlement API v2: https://www.paytmpayments.com/docs/settlement-processing-in-paytm
 * - Paytm Dispute Action & Status API: https://www.paytmpayments.com/docs/disputes
 */

import {
  Settlement,
  Dispute,
  DisputeStatus,
  SettlementStatus,
} from '@sulajh/shared';
import { db } from '../lib/db.js';

export interface PaytmSettlementDetailResponse {
  settlement_id: string;
  merchant_id: string;
  gross_amount: number;
  commission: number;
  gst_on_commission: number;
  refund_deductions: number;
  chargeback_deductions: number;
  recoveries: number;
  adjustments: number;
  net_payout: number;
  cycle: string;
  status: SettlementStatus;
  expected_at: string;
  paid_at?: string;
  failure_reason?: string;
  is_simulated: true;
}

export interface PaytmDisputeResponse {
  dispute_id: string;
  merchant_id: string;
  amount: number;
  status: DisputeStatus;
  reason: string;
  due_at: string;
  evidence_count: number;
  is_simulated: true;
}

export class PaytmGateway {
  /**
   * 1. getSettlementStatus: checks the status and ETA or failure reason of a settlement
   */
  public async getSettlementStatus(
    merchantId: string,
    settlementIdOrDate?: string,
  ): Promise<{
    settlement_id: string;
    status: SettlementStatus;
    net: number;
    expected_at: string;
    failure_reason?: string;
    is_simulated: true;
  } | null> {
    const settlements = db.getSettlements(merchantId);
    if (settlements.length === 0) return null;

    let match: Settlement | undefined;
    if (settlementIdOrDate) {
      match = settlements.find(
        (s) =>
          s.id === settlementIdOrDate ||
          s.created_at.startsWith(settlementIdOrDate) ||
          s.expected_at.startsWith(settlementIdOrDate),
      );
    }
    // Default to the most recent settlement
    if (!match) {
      match = [...settlements].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];
    }

    if (!match) return null;

    return {
      settlement_id: match.id,
      status: match.status,
      net: match.net,
      expected_at: match.expected_at,
      failure_reason: match.failure_reason,
      is_simulated: true,
    };
  }

  /**
   * 2. getSettlementDetail: returns full deduction breakdown
   */
  public async getSettlementDetail(settlementId: string): Promise<PaytmSettlementDetailResponse | null> {
    const settlement = db.getSettlementById(settlementId);
    if (!settlement) return null;

    return {
      settlement_id: settlement.id,
      merchant_id: settlement.merchant_id,
      gross_amount: settlement.gross,
      commission: settlement.commission,
      gst_on_commission: settlement.gst,
      refund_deductions: settlement.refunds,
      chargeback_deductions: settlement.chargebacks,
      recoveries: settlement.recoveries,
      adjustments: settlement.adjustments,
      net_payout: settlement.net,
      cycle: settlement.cycle,
      status: settlement.status,
      expected_at: settlement.expected_at,
      paid_at: settlement.paid_at,
      failure_reason: settlement.failure_reason,
      is_simulated: true,
    };
  }

  /**
   * 3. reinitiatePayout: re-submits a failed payout to NPCI/bank switch
   */
  public async reinitiatePayout(
    settlementId: string,
  ): Promise<{
    success: boolean;
    settlement_id: string;
    new_payout_reference: string;
    status: SettlementStatus;
    is_simulated: true;
  }> {
    const settlement = db.getSettlementById(settlementId);
    if (!settlement) {
      throw new Error(`Settlement ${settlementId} not found`);
    }

    const payoutRef = `PYTM-PAYOUT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update state to processing/paid
    db.updateSettlement(settlementId, {
      status: 'processing',
      failure_reason: undefined,
      paid_at: new Date().toISOString(),
    });

    return {
      success: true,
      settlement_id: settlement.id,
      new_payout_reference: payoutRef,
      status: 'processing',
      is_simulated: true,
    };
  }

  /**
   * 4. getDispute: retrieves dispute details
   */
  public async getDispute(disputeId: string): Promise<PaytmDisputeResponse | null> {
    const dispute = db.getDisputeById(disputeId);
    if (!dispute) return null;
    const evidenceList = db.getEvidence(disputeId);

    return {
      dispute_id: dispute.id,
      merchant_id: dispute.merchant_id,
      amount: dispute.amount,
      status: dispute.status,
      reason: dispute.reason,
      due_at: dispute.due_at,
      evidence_count: evidenceList.length,
      is_simulated: true,
    };
  }

  /**
   * 5. listDisputes: lists all disputes for a merchant
   */
  public async listDisputes(merchantId: string): Promise<PaytmDisputeResponse[]> {
    const disputes = db.getDisputes(merchantId);
    return disputes.map((d) => {
      const evidence = db.getEvidence(d.id);
      return {
        dispute_id: d.id,
        merchant_id: d.merchant_id,
        amount: d.amount,
        status: d.status,
        reason: d.reason,
        due_at: d.due_at,
        evidence_count: evidence.length,
        is_simulated: true,
      };
    });
  }

  /**
   * 6. submitDisputeAction: submits Accept or Defend with proof
   */
  public async submitDisputeAction(
    disputeId: string,
    action: 'ACCEPT' | 'DEFEND',
    evidenceIds: string[] = [],
  ): Promise<{
    success: boolean;
    dispute_id: string;
    new_status: DisputeStatus;
    message: string;
    is_simulated: true;
  }> {
    const dispute = db.getDisputeById(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found`);
    }

    if (action === 'ACCEPT') {
      db.updateDispute(disputeId, { status: 'LOST' });
      return {
        success: true,
        dispute_id: disputeId,
        new_status: 'LOST',
        message: 'Dispute accepted. Amount will be deducted from next settlement.',
        is_simulated: true,
      };
    } else {
      // DEFEND requires proof
      const newStatus: DisputeStatus = evidenceIds.length > 0 ? 'POD_UPLOAD' : 'NEW';
      db.updateDispute(disputeId, { status: newStatus });
      return {
        success: true,
        dispute_id: disputeId,
        new_status: newStatus,
        message:
          newStatus === 'POD_UPLOAD'
            ? 'Proof of delivery submitted to acquiring bank successfully.'
            : 'Dispute defence initiated. Awaiting proof of delivery.',
        is_simulated: true,
      };
    }
  }

  /**
   * 7. getDisputeStatus: tracks bank decision
   */
  public async getDisputeStatus(disputeId: string): Promise<{
    dispute_id: string;
    status: DisputeStatus;
    due_at: string;
    is_simulated: true;
  } | null> {
    const dispute = db.getDisputeById(disputeId);
    if (!dispute) return null;

    return {
      dispute_id: dispute.id,
      status: dispute.status,
      due_at: dispute.due_at,
      is_simulated: true,
    };
  }
}

export const paytmGateway = new PaytmGateway();

