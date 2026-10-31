import { paytmGateway } from '../services/paytmGateway.js';
import { policyEngine } from '../services/policyEngine.js';
import { reconcileSettlement } from './reconciliation.js';
import { planDisputes } from './disputePlanner.js';
import { searchQdrantKb } from './qdrant.js';
import { db } from '../lib/db.js';
import { PolicyResult } from '@sulajh/shared';

export interface ToolExecutionContext {
  merchantId: string;
  caseId: string;
}

export interface ToolResult {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  policyResult?: PolicyResult;
  recordRef?: string;
  ruleKey?: string;
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolResult> {
  const { merchantId, caseId } = context;

  switch (toolName) {
    case 'get_settlement_status': {
      const settlementId = args.settlement_id as string | undefined;
      const status = await paytmGateway.getSettlementStatus(merchantId, settlementId);
      return {
        tool: toolName,
        input: args,
        output: status ? (status as unknown as Record<string, unknown>) : { not_found: true },
        recordRef: status ? `SETTLEMENT-${status.settlement_id.slice(0, 8)}` : undefined,
        ruleKey: 'paytm_settlement_status_v2',
      };
    }

    case 'get_settlement_breakdown': {
      const settlementId = args.settlement_id as string;
      const detail = await paytmGateway.getSettlementDetail(settlementId);

      // Isolation check
      if (detail && detail.merchant_id !== merchantId) {
        throw new Error('Unauthorized: Settlement does not belong to this merchant');
      }

      return {
        tool: toolName,
        input: args,
        output: detail ? (detail as unknown as Record<string, unknown>) : { not_found: true },
        recordRef: detail ? `SETTLEMENT-BREAKDOWN-${detail.settlement_id.slice(0, 8)}` : undefined,
        ruleKey: 'paytm_deduction_policy_sec4.3',
      };
    }

    case 'reinitiate_payout': {
      const settlementId = args.settlement_id as string;
      const settlement = db.getSettlementById(settlementId);

      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }
      if (settlement.merchant_id !== merchantId) {
        throw new Error('Unauthorized: Settlement does not belong to this merchant');
      }

      // Money Safety: Policy Check in code before any payout action!
      const policyDecision = policyEngine.evaluate({
        actor: 'system_agent',
        action: 'reinitiate_payout',
        amount: settlement.net,
        merchantId,
        caseId,
      });

      if (policyDecision.result !== 'allow') {
        // Create an approval record for human Ops review
        const approval = db.createApproval({
          case_id: caseId,
          action: 'reinitiate_payout',
          amount: settlement.net,
          requested_by: 'usr-sys-1',
          decision: 'pending',
          summary: `Payout re-initiation for settlement ${settlement.id} (₹${settlement.net.toLocaleString('en-IN')}) requires authorization. Reason: ${policyDecision.reason}`,
          recommendation: `Approve re-initiation after confirming updated bank details.`,
          risk_level: settlement.net > 25000 ? 'high' : 'medium',
          action_on_approve: `Execute paytmGateway.reinitiatePayout(settlementId='${settlement.id}')`,
        });

        db.updateCase(caseId, { status: 'needs_approval' });

        return {
          tool: toolName,
          input: args,
          output: {
            status: 'needs_approval',
            approval_id: approval.id,
            reason: policyDecision.reason,
            required_role: policyDecision.requiredRole,
          },
          policyResult: policyDecision,
          recordRef: `APPROVAL-${approval.id.slice(0, 8)}`,
          ruleKey: 'paytm_approval_limits_policy',
        };
      }

      // Action allowed -> proceed with payout execution
      const result = await paytmGateway.reinitiatePayout(settlementId);
      return {
        tool: toolName,
        input: args,
        output: result as unknown as Record<string, unknown>,
        policyResult: policyDecision,
        recordRef: `PAYOUT-REF-${result.new_payout_reference}`,
        ruleKey: 'paytm_payout_reinit_v1',
      };
    }

    case 'list_disputes': {
      const disputes = await paytmGateway.listDisputes(merchantId);
      return {
        tool: toolName,
        input: args,
        output: { count: disputes.length, disputes },
        ruleKey: 'paytm_disputes_list_v2',
      };
    }

    case 'get_dispute': {
      const disputeId = args.dispute_id as string;
      const dispute = await paytmGateway.getDispute(disputeId);

      if (dispute && dispute.merchant_id !== merchantId) {
        throw new Error('Unauthorized: Dispute does not belong to this merchant');
      }

      return {
        tool: toolName,
        input: args,
        output: dispute ? (dispute as unknown as Record<string, unknown>) : { not_found: true },
        recordRef: dispute ? `DISPUTE-${dispute.dispute_id.slice(0, 8)}` : undefined,
        ruleKey: 'paytm_dispute_sla_policy',
      };
    }

    case 'submit_dispute_action': {
      const disputeId = args.dispute_id as string;
      const action = args.action as 'ACCEPT' | 'DEFEND';
      const evidenceIds = (args.evidence_ids as string[]) || [];

      const dispute = db.getDisputeById(disputeId);
      if (!dispute) throw new Error(`Dispute ${disputeId} not found`);
      if (dispute.merchant_id !== merchantId) {
        throw new Error('Unauthorized: Dispute does not belong to this merchant');
      }

      // Policy check on dispute action
      const policyDecision = policyEngine.evaluate({
        actor: 'system_agent',
        action: 'submit_dispute_action',
        amount: dispute.amount,
        merchantId,
        caseId,
      });

      if (policyDecision.result !== 'allow') {
        const approval = db.createApproval({
          case_id: caseId,
          action: 'submit_dispute_defence',
          amount: dispute.amount,
          requested_by: 'usr-sys-1',
          decision: 'pending',
          summary: `High-value dispute defence filing for ₹${dispute.amount.toLocaleString('en-IN')}. Reason: ${policyDecision.reason}`,
          recommendation: `Approve defence. Merchant has submitted required delivery proof.`,
          risk_level: dispute.amount > 25000 ? 'high' : 'medium',
          action_on_approve: `Execute paytmGateway.submitDisputeAction(disputeId='${dispute.id}', action='DEFEND')`,
        });

        db.updateCase(caseId, { status: 'needs_approval' });

        return {
          tool: toolName,
          input: args,
          output: {
            status: 'needs_approval',
            approval_id: approval.id,
            reason: policyDecision.reason,
            required_role: policyDecision.requiredRole,
          },
          policyResult: policyDecision,
          recordRef: `APPROVAL-${approval.id.slice(0, 8)}`,
          ruleKey: 'paytm_high_value_dispute_rule',
        };
      }

      const result = await paytmGateway.submitDisputeAction(disputeId, action, evidenceIds);
      return {
        tool: toolName,
        input: args,
        output: result as unknown as Record<string, unknown>,
        policyResult: policyDecision,
        recordRef: `DISPUTE-ACTION-${disputeId.slice(0, 8)}`,
        ruleKey: 'paytm_dispute_action_v2',
      };
    }

    case 'reconcile_settlement': {
      const settlementId = args.settlement_id as string;
      const reconciliation = reconcileSettlement(settlementId);

      // If mismatch, automatically escalate to Ops with the difference and records checked
      if (!reconciliation.matched) {
        db.createApproval({
          case_id: caseId,
          action: 'reconcile_mismatch_review',
          amount: reconciliation.difference,
          requested_by: 'usr-sys-1',
          decision: 'pending',
          summary: `Settlement ${settlementId} reconciliation failure: Discrepancy of ₹${reconciliation.difference.toLocaleString('en-IN')}. Recorded Net: ₹${reconciliation.actual_net}, Expected Net: ₹${reconciliation.expected_net}`,
          recommendation: 'Finance review of ledger entries required.',
          risk_level: 'medium',
          action_on_approve: 'Manual ledger balance adjustment',
        });
        db.updateCase(caseId, { status: 'needs_approval' });
      }

      return {
        tool: toolName,
        input: args,
        output: reconciliation as unknown as Record<string, unknown>,
        recordRef: `RECON-${settlementId.slice(0, 8)}`,
        ruleKey: 'paytm_settlement_reconciliation_math',
      };
    }

    case 'plan_disputes': {
      const plans = planDisputes(merchantId);
      return {
        tool: toolName,
        input: args,
        output: { count: plans.length, plans },
        ruleKey: 'paytm_dispute_deadline_priority_matrix',
      };
    }

    case 'search_knowledge': {
      const query = (args.query as string) || '';
      const chunks = await searchQdrantKb(query);
      return {
        tool: toolName,
        input: args,
        output: { count: chunks.length, results: chunks },
        recordRef: chunks.length > 0 ? chunks[0].source : undefined,
        ruleKey: chunks.length > 0 ? chunks[0].rule_key || 'paytm_merchant_knowledge_base' : 'paytm_merchant_knowledge_base',
      };
    }

    case 'request_evidence': {
      const disputeId = args.dispute_id as string;
      const instructions =
        'Please upload an official Proof of Delivery (POD) signed by the recipient or a valid GST Tax Invoice with customer signature within 48 hours.';
      return {
        tool: toolName,
        input: args,
        output: { dispute_id: disputeId, required_proof: instructions },
        recordRef: `EVIDENCE-REQ-${disputeId.slice(0, 8)}`,
        ruleKey: 'paytm_chargeback_evidence_sla',
      };
    }

    case 'escalate_to_human': {
      const reason = (args.reason as string) || 'Complex merchant inquiry';
      const role = (args.required_role as 'ops_agent' | 'ops_manager') || 'ops_agent';

      const approval = db.createApproval({
        case_id: caseId,
        action: 'human_escalation',
        amount: 0,
        requested_by: 'usr-sys-1',
        decision: 'pending',
        summary: `Case escalated: ${reason}`,
        recommendation: `Manual assistance by ${role}`,
        risk_level: 'medium',
        action_on_approve: 'Contact merchant directly',
      });

      db.updateCase(caseId, { status: 'needs_approval' });

      return {
        tool: toolName,
        input: args,
        output: { escalated: true, approval_id: approval.id, assigned_role: role },
        recordRef: `ESCALATION-${approval.id.slice(0, 8)}`,
        ruleKey: 'paytm_escalation_protocol',
      };
    }

    case 'open_or_join_incident': {
      const bank = (args.bank as string) || 'HDFC Bank';
      const cause = (args.cause as string) || 'Bank core gateway timeout';

      const incidents = db.getIncidents();
      let incident = incidents.find((i) => i.bank === bank && i.status === 'open');

      if (!incident) {
        incident = db.createIncident({
          cause,
          bank,
          status: 'open',
          merchant_count: 1,
        });
      } else {
        incident = db.updateIncident(incident.id, {
          merchant_count: incident.merchant_count + 1,
        });
      }

      db.updateCase(caseId, { incident_id: incident.id });

      return {
        tool: toolName,
        input: args,
        output: { incident_id: incident.id, bank: incident.bank, merchant_count: incident.merchant_count },
        recordRef: `INCIDENT-${incident.id.slice(0, 8)}`,
        ruleKey: 'paytm_incident_aggregation_policy',
      };
    }

    default:
      throw new Error(`Tool '${toolName}' is not in the approved autonomous tool allow-list`);
  }
}

