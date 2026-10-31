import { Role, PolicyResult } from '@sulajh/shared';
import { db } from '../lib/db.js';

export interface PolicyEvaluationParams {
  actor: Role;
  action: 'reinitiate_payout' | 'submit_dispute_action' | 'refund' | 'general';
  amount: number;
  merchantId: string;
  caseId?: string;
  claimInChat?: string; // e.g. "I am the owner"
}

export class PolicyEngine {
  /**
   * Evaluates if a monetary or sensitive action is allowed, needs human approval, or is refused.
   * Enforced strictly in code — the LLM can never override this logic.
   */
  public evaluate(params: PolicyEvaluationParams): PolicyResult {
    const { actor, action, amount, merchantId, caseId, claimInChat } = params;

    // Load dynamic limits from database policies (Admin editable)
    const agentLimit = parseFloat(db.getPolicyValue('agent_approval_limit', '5000'));
    const opsAgentLimit = parseFloat(db.getPolicyValue('ops_agent_approval_limit', '25000'));
    const dailyCap = parseFloat(db.getPolicyValue('merchant_daily_payout_cap', '50000'));
    const maxRetries = parseInt(db.getPolicyValue('max_payout_reinitiations_per_case', '2'), 10);

    const merchant = db.getMerchantById(merchantId);

    // Rule 1: Fraud signals and merchant risk flags always require human manager approval
    if (merchant?.risk_flag) {
      const decision: PolicyResult = {
        result: 'needs_approval',
        reason: 'Merchant account is flagged for risk review. Human Ops Manager authorization required.',
        requiredRole: 'ops_manager',
      };
      this.recordAudit(params, decision);
      return decision;
    }

    // Rule 2: Max automatic payout re-initiations per case
    if (caseId && action === 'reinitiate_payout') {
      const priorSteps = db.getAgentSteps(caseId);
      const reinitCount = priorSteps.filter(
        (s) => s.tool === 'reinitiate_payout' && s.policy_result?.result === 'allow',
      ).length;

      if (reinitCount >= maxRetries) {
        const decision: PolicyResult = {
          result: 'refuse',
          reason: `Maximum autonomous re-initiation limit (${maxRetries} attempts) reached for this case. Repeated failures require manual investigation.`,
          requiredRole: 'ops_agent',
        };
        this.recordAudit(params, decision);
        return decision;
      }
    }

    // Rule 3: Chat claims like "I am the owner" are NOT verification (Rule 3 in non-negotiable rules)
    if (claimInChat && /owner|malik|boss|proprietor/i.test(claimInChat)) {
      // Chat claims are deliberately ignored for authorization bypass
    }

    // Rule 4: Daily merchant cap check
    if (amount > dailyCap) {
      const decision: PolicyResult = {
        result: 'refuse',
        reason: `Requested amount of ₹${amount.toLocaleString('en-IN')} exceeds the merchant maximum daily payout ceiling of ₹${dailyCap.toLocaleString('en-IN')}.`,
        requiredRole: 'ops_manager',
      };
      this.recordAudit(params, decision);
      return decision;
    }

    // Rule 5: Role limit checks
    if (actor === 'system_agent' || actor === 'merchant') {
      if (amount <= agentLimit) {
        const decision: PolicyResult = {
          result: 'allow',
          reason: `Autonomous action approved: Amount ₹${amount.toLocaleString('en-IN')} is within agent limit of ₹${agentLimit.toLocaleString('en-IN')}.`,
        };
        this.recordAudit(params, decision);
        return decision;
      } else {
        // Large amount requested: refuse politely, name the Ops Manager role
        const decision: PolicyResult = {
          result: 'needs_approval',
          reason: `Amount ₹${amount.toLocaleString('en-IN')} exceeds autonomous agent limit of ₹${agentLimit.toLocaleString('en-IN')}. This transaction requires verified authorization by the Ops Manager.`,
          requiredRole: 'ops_manager',
        };
        this.recordAudit(params, decision);
        return decision;
      }
    }

    if (actor === 'ops_agent') {
      if (amount <= opsAgentLimit) {
        const decision: PolicyResult = {
          result: 'allow',
          reason: `Ops Agent approved: Amount ₹${amount.toLocaleString('en-IN')} is within L1 limit of ₹${opsAgentLimit.toLocaleString('en-IN')}.`,
        };
        this.recordAudit(params, decision);
        return decision;
      } else {
        const decision: PolicyResult = {
          result: 'needs_approval',
          reason: `Amount ₹${amount.toLocaleString('en-IN')} exceeds Ops Agent limit of ₹${opsAgentLimit.toLocaleString('en-IN')}. Escalation to Ops Manager required.`,
          requiredRole: 'ops_manager',
        };
        this.recordAudit(params, decision);
        return decision;
      }
    }

    if (actor === 'ops_manager' || actor === 'admin') {
      const decision: PolicyResult = {
        result: 'allow',
        reason: `Executive approval granted by ${actor} for ₹${amount.toLocaleString('en-IN')}.`,
      };
      this.recordAudit(params, decision);
      return decision;
    }

    const defaultDecision: PolicyResult = {
      result: 'refuse',
      reason: 'Unknown authorization state.',
      requiredRole: 'ops_agent',
    };
    this.recordAudit(params, defaultDecision);
    return defaultDecision;
  }

  private recordAudit(params: PolicyEvaluationParams, result: PolicyResult): void {
    db.logAudit({
      actor_type: params.actor,
      actor_id: params.merchantId,
      case_id: params.caseId,
      action: 'policy_evaluation',
      details: {
        action: params.action,
        amount: params.amount,
        decision: result.result,
        reason: result.reason,
        requiredRole: result.requiredRole,
      },
    });
  }
}

export const policyEngine = new PolicyEngine();

