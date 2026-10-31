import { DisputePlan, Priority } from '@sulajh/shared';
import { db } from '../lib/db.js';

export function planDisputes(merchantId: string): DisputePlan[] {
  const disputes = db.getDisputes(merchantId);
  const openDisputes = disputes.filter((d) => d.status !== 'WON' && d.status !== 'LOST');

  const now = Date.now();

  const plans: DisputePlan[] = openDisputes.map((dispute) => {
    const evidence = db.getEvidence(dispute.id);
    const hasEvidence = evidence.length > 0;
    const dueTime = new Date(dispute.due_at).getTime();
    const daysRemaining = Math.max(0, Math.ceil((dueTime - now) / 86400000));

    let priority: Priority = 'low';
    const reasons: string[] = [];
    let next_action = '';

    // Calculate priority based on statutory deadline and financial impact
    if (daysRemaining <= 2) {
      priority = 'high';
      reasons.push(`Statutory bank response deadline expires in ${daysRemaining} day(s)`);
    } else if (daysRemaining <= 6 || dispute.amount >= 5000) {
      priority = 'medium';
      if (daysRemaining <= 6) reasons.push(`Dispute due in ${daysRemaining} days`);
      if (dispute.amount >= 5000) reasons.push(`High financial impact (₹${dispute.amount.toLocaleString('en-IN')})`);
    } else {
      priority = 'low';
      reasons.push(`Standard timeline (${daysRemaining} days remaining)`);
    }

    // Determine next actionable step
    if (dispute.status === 'POD_REJECT') {
      next_action = 'Bank rejected previous proof. Re-upload clear tax invoice and signed POD.';
      reasons.push('Action required: Rejected proof on file');
      priority = 'high';
    } else if (dispute.status === 'POD_UPLOAD') {
      next_action = 'Proof uploaded. Awaiting acquiring bank review.';
    } else if (hasEvidence) {
      next_action = `Defend dispute using uploaded proof (${evidence[0].kind}).`;
    } else {
      next_action = 'Request delivery slip or store CCTV proof from merchant.';
      reasons.push('Missing proof of delivery');
    }

    return {
      dispute_id: dispute.id,
      priority,
      reasons,
      next_action,
      deadline: dispute.due_at,
    };
  });

  // Sort: High priority first, then closest deadline, then highest amount
  const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

  return plans.sort((a, b) => {
    const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

