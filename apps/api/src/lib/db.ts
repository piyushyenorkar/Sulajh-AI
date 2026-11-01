import {
  User,
  Merchant,
  Settlement,
  Transaction,
  Dispute,
  Evidence,
  Case,
  Message,
  AgentStep,
  Approval,
  Policy,
  AuditLog,
  Event,
  KbChunk,
  Incident,
  AnswerSource,
  PolicySuggestion,
  Role,
} from '@sulajh/shared';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from './supabase.js';
import { logger } from './logger.js';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DatabaseState {
  users: User[];
  merchants: Merchant[];
  settlements: Settlement[];
  transactions: Transaction[];
  disputes: Dispute[];
  evidence: Evidence[];
  cases: Case[];
  messages: Message[];
  agent_steps: AgentStep[];
  approvals: Approval[];
  policies: Policy[];
  audit_log: AuditLog[];
  events: Event[];
  kb_chunks: KbChunk[];
  incidents: Incident[];
  answer_sources: AnswerSource[];
  policy_suggestions: PolicySuggestion[];
}

export class Database {
  private supabase: SupabaseClient | null = null;
  private state: DatabaseState = {
    users: [],
    merchants: [],
    settlements: [],
    transactions: [],
    disputes: [],
    evidence: [],
    cases: [],
    messages: [],
    agent_steps: [],
    approvals: [],
    policies: [],
    audit_log: [],
    events: [],
    kb_chunks: [],
    incidents: [],
    answer_sources: [],
    policy_suggestions: [],
  };

  constructor() {
    this.seed();
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        this.supabase = createAdminClient();
        logger.info({ url: process.env.SUPABASE_URL }, 'Connected to live Supabase PostgreSQL database layer');
      }
    } catch {
      // In-memory fallback
    }
  }

  public reset(): void {
    this.state = {
      users: [],
      merchants: [],
      settlements: [],
      transactions: [],
      disputes: [],
      evidence: [],
      cases: [],
      messages: [],
      agent_steps: [],
      approvals: [],
      policies: [],
      audit_log: [],
      events: [],
      kb_chunks: [],
      incidents: [],
      answer_sources: [],
      policy_suggestions: [],
    };
    this.seed();
  }

  // ─── AUDIT LOG (APPEND ONLY - RULE 5) ───────────────────────────────────────
  public logAudit(entry: {
    actor_type: AuditLog['actor_type'];
    actor_id: string;
    case_id?: string;
    action: string;
    details: Record<string, unknown>;
  }): AuditLog {
    const log: AuditLog = {
      id: uuidv4(),
      ts: new Date().toISOString(),
      ...entry,
    };
    this.state.audit_log.push(log);

    // Live Supabase PostgreSQL Persistence
    if (this.supabase) {
      this.supabase.from('audit_log').insert({
        id: log.id,
        ts: log.ts,
        actor_type: log.actor_type,
        actor_id: log.actor_id,
        case_id: log.case_id || null,
        action: log.action,
        details: log.details,
      }).then(() => {}, () => {});
    }

    return log;
  }

  public getAuditLogs(filter?: { case_id?: string; actor_id?: string; action?: string }): AuditLog[] {
    let logs = [...this.state.audit_log];
    if (filter?.case_id) logs = logs.filter((l) => l.case_id === filter.case_id);
    if (filter?.actor_id) logs = logs.filter((l) => l.actor_id === filter.actor_id);
    if (filter?.action) logs = logs.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    return logs.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }

  public attemptModifyAuditLog(): never {
    throw new Error('audit_log is append-only: UPDATE and DELETE are strictly forbidden by security policy');
  }

  // ─── USERS & MERCHANTS ─────────────────────────────────────────────────────
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean === '9876543210' || clean.endsWith('9876543210')) {
      return this.state.users.find((u) => u.id === 'usr-m-1') || this.state.users.find((u) => u.phone?.replace(/[^0-9]/g, '').endsWith(clean.slice(-10)));
    }
    return this.state.users.find((u) => u.phone?.replace(/[^0-9]/g, '').endsWith(clean.slice(-10)));
  }

  public getUserByEmail(email: string): User | undefined {
    const clean = email.toLowerCase().trim();
    if (clean === 'piyushyenorkar1@gmail.com' || clean === 'ramesh@kirana.in') {
      return this.state.users.find((u) => u.email?.toLowerCase() === 'piyushyenorkar1@gmail.com' || u.id === 'usr-m-1');
    }
    if (clean === 'piyushyenorkar02@gmail.com') {
      return this.state.users.find((u) => u.email?.toLowerCase() === 'piyushyenorkar02@gmail.com' || u.id === 'usr-piyush-staff');
    }
    return this.state.users.find((u) => u.email?.toLowerCase() === clean);
  }

  public getMerchants(): Merchant[] {
    return this.state.merchants;
  }

  public getMerchantById(id: string): Merchant | undefined {
    return this.state.merchants.find((m) => m.id === id);
  }

  public getMerchantByUserId(userId: string): Merchant | undefined {
    return this.state.merchants.find((m) => m.user_id === userId);
  }

  // ─── SETTLEMENTS ────────────────────────────────────────────────────────────
  public getSettlements(merchantId?: string): Settlement[] {
    if (!merchantId) return this.state.settlements;
    return this.state.settlements.filter((s) => s.merchant_id === merchantId);
  }

  public getSettlementById(id: string): Settlement | undefined {
    return this.state.settlements.find((s) => s.id === id);
  }

  public updateSettlement(id: string, updates: Partial<Settlement>): Settlement {
    const index = this.state.settlements.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Settlement ${id} not found`);
    const updated = { ...this.state.settlements[index], ...updates };
    this.state.settlements[index] = updated;
    return updated;
  }

  // ─── DISPUTES ───────────────────────────────────────────────────────────────
  public getDisputes(merchantId?: string): Dispute[] {
    if (!merchantId) return this.state.disputes;
    return this.state.disputes.filter((d) => d.merchant_id === merchantId);
  }

  public getDisputeById(id: string): Dispute | undefined {
    return this.state.disputes.find((d) => d.id === id);
  }

  public updateDispute(id: string, updates: Partial<Dispute>): Dispute {
    const index = this.state.disputes.findIndex((d) => d.id === id);
    if (index === -1) throw new Error(`Dispute ${id} not found`);
    const updated = { ...this.state.disputes[index], ...updates };
    this.state.disputes[index] = updated;
    return updated;
  }

  // ─── EVIDENCE ──────────────────────────────────────────────────────────────
  public getEvidence(disputeId: string): Evidence[] {
    return this.state.evidence.filter((e) => e.dispute_id === disputeId);
  }

  public addEvidence(evidence: Omit<Evidence, 'id' | 'created_at'>): Evidence {
    const record: Evidence = {
      ...evidence,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.evidence.push(record);
    return record;
  }

  // ─── CASES & MESSAGES ───────────────────────────────────────────────────────
  public getCases(filter?: { merchant_id?: string; status?: Case['status'] }): Case[] {
    let cases = [...this.state.cases];
    if (filter?.merchant_id) cases = cases.filter((c) => c.merchant_id === filter.merchant_id);
    if (filter?.status) cases = cases.filter((c) => c.status === filter.status);
    return cases.sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());
  }

  public getCaseById(id: string): Case | undefined {
    return this.state.cases.find((c) => c.id === id);
  }

  public createCase(newCase: Omit<Case, 'id' | 'opened_at'>): Case {
    const record: Case = {
      ...newCase,
      id: uuidv4(),
      opened_at: new Date().toISOString(),
    };
    this.state.cases.push(record);
    return record;
  }

  public updateCase(id: string, updates: Partial<Case>): Case {
    const index = this.state.cases.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Case ${id} not found`);
    const updated = { ...this.state.cases[index], ...updates };
    this.state.cases[index] = updated;
    return updated;
  }

  public getMessages(caseId: string): Message[] {
    return this.state.messages
      .filter((m) => m.case_id === caseId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public addMessage(msg: Omit<Message, 'id' | 'created_at'>): Message {
    const record: Message = {
      ...msg,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.messages.push(record);

    // Live Supabase PostgreSQL Persistence
    if (this.supabase) {
      // Map case-1 / case-2 / case-3 to valid UUIDs if needed
      let targetCaseId = record.case_id;
      if (targetCaseId === 'case-1') targetCaseId = '10000000-0000-0000-0000-000000000001';
      else if (targetCaseId === 'case-2') targetCaseId = '10000000-0000-0000-0000-000000000002';
      else if (targetCaseId === 'case-3') targetCaseId = '10000000-0000-0000-0000-000000000003';

      this.supabase.from('messages').insert({
        id: record.id,
        case_id: targetCaseId,
        sender: record.sender,
        text: record.text,
        lang: record.lang || 'hinglish',
        created_at: record.created_at,
      }).then(() => {}, () => {});
    }

    return record;
  }

  // ─── AGENT STEPS ───────────────────────────────────────────────────────────
  public getAgentSteps(caseId: string): AgentStep[] {
    return this.state.agent_steps
      .filter((s) => s.case_id === caseId)
      .sort((a, b) => a.step_no - b.step_no);
  }

  public addAgentStep(step: Omit<AgentStep, 'id' | 'created_at'>): AgentStep {
    const record: AgentStep = {
      ...step,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.agent_steps.push(record);
    return record;
  }

  // ─── APPROVALS ─────────────────────────────────────────────────────────────
  public getApprovals(filter?: { case_id?: string; decision?: Approval['decision'] }): Approval[] {
    let approvals = [...this.state.approvals];
    if (filter?.case_id) approvals = approvals.filter((a) => a.case_id === filter.case_id);
    if (filter?.decision) approvals = approvals.filter((a) => a.decision === filter.decision);
    return approvals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getApprovalById(id: string): Approval | undefined {
    return this.state.approvals.find((a) => a.id === id);
  }

  public createApproval(approval: Omit<Approval, 'id' | 'created_at'>): Approval {
    const record: Approval = {
      ...approval,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.approvals.push(record);
    return record;
  }

  public updateApproval(id: string, updates: Partial<Approval>): Approval {
    const index = this.state.approvals.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Approval ${id} not found`);
    const updated = { ...this.state.approvals[index], ...updates };
    this.state.approvals[index] = updated;
    return updated;
  }

  // ─── POLICIES ──────────────────────────────────────────────────────────────
  public getPolicies(): Policy[] {
    return this.state.policies.filter((p) => p.active);
  }

  public getPolicyValue(key: string, defaultValue: string): string {
    const policy = this.state.policies.find((p) => p.key === key && p.active);
    return policy ? policy.value : defaultValue;
  }

  public updatePolicy(key: string, value: string, actorId: string): Policy {
    const existing = this.state.policies.find((p) => p.key === key && p.active);
    const newVersion = existing ? existing.version + 1 : 1;
    if (existing) existing.active = false;

    const newPolicy: Policy = {
      id: uuidv4(),
      version: newVersion,
      key,
      value,
      active: true,
      created_at: new Date().toISOString(),
    };
    this.state.policies.push(newPolicy);

    this.logAudit({
      actor_type: 'admin',
      actor_id: actorId,
      action: 'policy_update',
      details: { key, oldValue: existing?.value, newValue: value, version: newVersion },
    });

    return newPolicy;
  }

  // ─── INCIDENTS ─────────────────────────────────────────────────────────────
  public getIncidents(): Incident[] {
    return [...this.state.incidents].sort(
      (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
    );
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.state.incidents.find((i) => i.id === id);
  }

  public createIncident(incident: Omit<Incident, 'id' | 'opened_at'>): Incident {
    const record: Incident = {
      ...incident,
      id: uuidv4(),
      opened_at: new Date().toISOString(),
    };
    this.state.incidents.push(record);
    return record;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident {
    const index = this.state.incidents.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Incident ${id} not found`);
    const updated = { ...this.state.incidents[index], ...updates };
    this.state.incidents[index] = updated;
    return updated;
  }

  // ─── ANSWER SOURCES ────────────────────────────────────────────────────────
  public addAnswerSource(source: Omit<AnswerSource, 'id'>): AnswerSource {
    const record: AnswerSource = {
      ...source,
      id: uuidv4(),
    };
    this.state.answer_sources.push(record);
    return record;
  }

  public getAnswerSources(caseId: string): AnswerSource[] {
    return this.state.answer_sources.filter((s) => s.case_id === caseId);
  }

  // ─── POLICY SUGGESTIONS ────────────────────────────────────────────────────
  public getPolicySuggestions(): PolicySuggestion[] {
    return this.state.policy_suggestions;
  }

  public updatePolicySuggestionStatus(id: string, status: PolicySuggestion['status']): PolicySuggestion {
    const index = this.state.policy_suggestions.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Suggestion ${id} not found`);
    this.state.policy_suggestions[index].status = status;
    return this.state.policy_suggestions[index];
  }

  // ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────
  public getKbChunks(): KbChunk[] {
    return this.state.kb_chunks;
  }

  public searchKb(query: string): KbChunk[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.state.kb_chunks.filter((c) => {
      const text = (c.source + ' ' + c.text).toLowerCase();
      return words.some((w) => text.includes(w));
    });
  }

  // ─── SEED INITIAL DATA (Idempotent) ────────────────────────────────────────
  private seed(): void {
    // 1. Policies
    this.state.policies = [
      { id: 'pol-1', version: 1, key: 'agent_approval_limit', value: '5000', active: true, created_at: new Date().toISOString() },
      { id: 'pol-2', version: 1, key: 'ops_agent_approval_limit', value: '25000', active: true, created_at: new Date().toISOString() },
      { id: 'pol-3', version: 1, key: 'merchant_daily_payout_cap', value: '50000', active: true, created_at: new Date().toISOString() },
      { id: 'pol-4', version: 1, key: 'incident_failure_threshold', value: '5', active: true, created_at: new Date().toISOString() },
      { id: 'pol-5', version: 1, key: 'incident_window_minutes', value: '60', active: true, created_at: new Date().toISOString() },
      { id: 'pol-6', version: 1, key: 'max_agent_steps', value: '8', active: true, created_at: new Date().toISOString() },
      { id: 'pol-7', version: 1, key: 'max_payout_reinitiations_per_case', value: '2', active: true, created_at: new Date().toISOString() },
    ];

    // 2. Staff Users
    const adminUser: User = { id: 'usr-admin-1', role: 'admin', name: 'Piyush Admin', email: 'piyush.admin@paytm.com', phone: '+919999900001', active: true, created_at: new Date().toISOString() };
    const opsManager: User = { id: 'usr-mgr-1', role: 'ops_manager', name: 'Neha Gupta (Ops Manager)', email: 'neha.manager@paytm.com', phone: '+919999900002', active: true, created_at: new Date().toISOString() };
    const opsAgent: User = { id: 'usr-ops-1', role: 'ops_agent', name: 'Vikram Singh (Ops Agent)', email: 'vikram.ops@paytm.com', phone: '+919999900003', active: true, created_at: new Date().toISOString() };
    const systemAgent: User = { id: 'usr-sys-1', role: 'system_agent', name: 'Sulajh AI Engine', email: 'engine@sulajh.ai', active: true, created_at: new Date().toISOString() };
    const piyushStaff: User = { id: 'usr-piyush-staff', role: 'ops_agent', name: 'Piyush Yenorkar (Staff)', email: 'piyushyenorkar02@gmail.com', phone: '+917498735223', active: true, created_at: new Date().toISOString() };

    this.state.users.push(adminUser, opsManager, opsAgent, systemAgent, piyushStaff);

    // 3. 8 Merchants
    const merchantConfigs = [
      { id: 'merch-1', usrId: 'usr-m-1', name: 'Piyush Yenorkar', biz: "Piyush's Food Plaza & Kirana", lang: 'hinglish' as const, bank: '5223', phone: '7498735223', email: 'piyushyenorkar1@gmail.com', cat: 'Grocery / Kirana', risk: false },
      { id: 'merch-2', usrId: 'usr-m-2', name: 'Priya Sharma', biz: 'Priya Ethnic Boutique', lang: 'hi' as const, bank: '1092', phone: '9811223344', email: 'priya@boutique.in', cat: 'Apparel / Fashion', risk: false },
      { id: 'merch-3', usrId: 'usr-m-3', name: 'Ganesh Patil', biz: 'Ganesh Electronics', lang: 'mr' as const, bank: '7734', phone: '9822334455', email: 'ganesh@electronics.in', cat: 'Electronics', risk: false },
      { id: 'merch-4', usrId: 'usr-m-4', name: 'Sunil Sharma', biz: 'Sharma Sweets & Cafe', lang: 'hi' as const, bank: '6612', phone: '9833445566', email: 'sunil@sharmasweets.in', cat: 'Food & Beverage', risk: false },
      { id: 'merch-5', usrId: 'usr-m-5', name: 'Simran Kaur', biz: 'Modern Salon & Spa', lang: 'hinglish' as const, bank: '8823', phone: '9844556677', email: 'simran@modernsalon.in', cat: 'Personal Care', risk: false },
      { id: 'merch-6', usrId: 'usr-m-6', name: 'Rajesh Verma', biz: 'Verma Supermarket', lang: 'hinglish' as const, bank: '3341', phone: '9855667788', email: 'rajesh@vermasuper.in', cat: 'Supermarket', risk: false },
      { id: 'merch-7', usrId: 'usr-m-7', name: 'Ananya Mehta', biz: 'Ananya Diamond & Gold', lang: 'hi' as const, bank: '9901', phone: '9866778899', email: 'ananya@jewellers.in', cat: 'Jewellery', risk: true },
      { id: 'merch-8', usrId: 'usr-m-8', name: 'Dinesh Deshmukh', biz: 'Deccan Mobile Care', lang: 'mr' as const, bank: '5512', phone: '9877889900', email: 'dinesh@deccanmobile.in', cat: 'Mobile Services', risk: false },
    ];

    for (const c of merchantConfigs) {
      const u: User = {
        id: c.usrId,
        role: 'merchant',
        name: c.name,
        email: c.email || `${c.phone}@merchant.paytm.com`,
        phone: `+91${c.phone}`,
        active: true,
        created_at: new Date().toISOString(),
      };
      const m: Merchant = {
        id: c.id,
        user_id: c.usrId,
        business_name: c.biz,
        language: c.lang,
        bank_last4: c.bank,
        risk_flag: c.risk,
        phone_masked: `XXXX-XX${c.phone.slice(-4)}`,
        category: c.cat,
      };
      this.state.users.push(u);
      this.state.merchants.push(m);
    }

    // 4. Settlements (Scenario 1, 2, 3, 6, 7)
    // S1: Paid normal
    this.state.settlements.push({
      id: 'stl-1',
      merchant_id: 'merch-1',
      cycle: 'T+1',
      gross: 12500,
      commission: 250,
      gst: 45,
      refunds: 0,
      chargebacks: 0,
      recoveries: 0,
      adjustments: 0,
      net: 12205,
      status: 'paid',
      expected_at: new Date(Date.now() - 86400000).toISOString(),
      paid_at: new Date(Date.now() - 84600000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    });

    // S2: Failed (IFSC branch merger - Scenario 1)
    this.state.settlements.push({
      id: 'stl-2',
      merchant_id: 'merch-1',
      cycle: 'T+1',
      gross: 4850,
      commission: 97,
      gst: 17.46,
      refunds: 0,
      chargebacks: 0,
      recoveries: 0,
      adjustments: 0,
      net: 4735.54,
      status: 'failed',
      expected_at: new Date(Date.now() - 14400000).toISOString(),
      failure_reason: 'Beneficiary bank rejected transaction: IFSC code changed due to bank branch merger',
      created_at: new Date(Date.now() - 14400000).toISOString(),
    });

    // S3: Delayed past 120 mins (Scenario 2)
    this.state.settlements.push({
      id: 'stl-3',
      merchant_id: 'merch-1',
      cycle: 'same-day',
      gross: 18200,
      commission: 364,
      gst: 65.52,
      refunds: 0,
      chargebacks: 0,
      recoveries: 0,
      adjustments: 0,
      net: 17770.48,
      status: 'delayed',
      expected_at: new Date(Date.now() - 10800000).toISOString(),
      failure_reason: 'NPCI/IMPS clearing switch delay at sponsor bank. Expected clearance within 45 minutes.',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    });

    // S4: Heavy deductions (Scenario 3)
    this.state.settlements.push({
      id: 'stl-4',
      merchant_id: 'merch-1',
      cycle: 'T+1',
      gross: 10000,
      commission: 200,
      gst: 36,
      refunds: 250,
      chargebacks: 100,
      recoveries: 0,
      adjustments: 125, // Soundbox rental
      net: 9289,
      status: 'paid',
      expected_at: new Date(Date.now() - 172800000).toISOString(),
      paid_at: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString(),
    });

    // S5: DELIBERATE MISMATCH (Scenario 6 / B1 - The Reconciliation Engine test)
    // Gross: 50,000 | Comm: 1,000 | GST: 180 | Refunds: 2,500 | Chargebacks: 3,000
    // Expected Net = 50000 - 1000 - 180 - 2500 - 3000 = 43,320
    // Actual Recorded Net = 41,200 (Difference: 2,120 unexplained mismatch!)
    this.state.settlements.push({
      id: 'stl-5',
      merchant_id: 'merch-1',
      cycle: 'T+1',
      gross: 50000,
      commission: 1000,
      gst: 180,
      refunds: 2500,
      chargebacks: 3000,
      recoveries: 0,
      adjustments: 0,
      net: 41200,
      status: 'paid',
      expected_at: new Date(Date.now() - 432000000).toISOString(),
      paid_at: new Date(Date.now() - 432000000).toISOString(),
      created_at: new Date(Date.now() - 432000000).toISOString(),
    });

    // 10 Failed settlements for HDFC Bank within 1 hour (Incident demo)
    for (let i = 1; i <= 10; i++) {
      const mIdx = (i % 8) + 1;
      this.state.settlements.push({
        id: `stl-hdfc-${i}`,
        merchant_id: `merch-${mIdx}`,
        cycle: 'real-time',
        gross: 3000 + i * 500,
        commission: (3000 + i * 500) * 0.02,
        gst: (3000 + i * 500) * 0.02 * 0.18,
        refunds: 0,
        chargebacks: 0,
        recoveries: 0,
        adjustments: 0,
        net: (3000 + i * 500) * 0.9764,
        status: 'failed',
        expected_at: new Date(Date.now() - (60 - i * 4) * 60000).toISOString(),
        failure_reason: 'HDFC Bank core banking system timeout (CBS 91: Bank gateway down)',
        created_at: new Date(Date.now() - (60 - i * 4) * 60000).toISOString(),
      });
    }

    // 5. Disputes (Ramesh 5 disputes - Scenario 9)
    this.state.disputes = [
      {
        id: 'dsp-1',
        merchant_id: 'merch-1',
        txn_id: 'txn-1',
        amount: 8500,
        status: 'NEW',
        reason: 'Customer claims goods not delivered (Delivery dispute)',
        due_at: new Date(Date.now() + 2 * 86400000).toISOString(), // Due in 2 days (HIGH PRIORITY)
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 'dsp-2',
        merchant_id: 'merch-1',
        txn_id: 'txn-2',
        amount: 2400,
        status: 'NEW',
        reason: 'Duplicate payment charged to credit card',
        due_at: new Date(Date.now() + 5 * 86400000).toISOString(), // Due in 5 days (MEDIUM PRIORITY)
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'dsp-3',
        merchant_id: 'merch-1',
        txn_id: 'txn-3',
        amount: 1200,
        status: 'POD_UPLOAD',
        reason: 'Customer disputes transaction authorization',
        due_at: new Date(Date.now() + 9 * 86400000).toISOString(), // POD already uploaded
        created_at: new Date(Date.now() - 345600000).toISOString(),
      },
      {
        id: 'dsp-4',
        merchant_id: 'merch-1',
        txn_id: 'txn-4',
        amount: 3100,
        status: 'POD_REJECT',
        reason: 'Proof of delivery illegible, bank requested tax invoice re-upload',
        due_at: new Date(Date.now() + 12 * 86400000).toISOString(), // POD rejected
        created_at: new Date(Date.now() - 518400000).toISOString(),
      },
      {
        id: 'dsp-5',
        merchant_id: 'merch-1',
        txn_id: 'txn-5',
        amount: 450,
        status: 'NEW',
        reason: 'Incorrect amount charged at checkout',
        due_at: new Date(Date.now() + 14 * 86400000).toISOString(), // Due in 14 days (LOW PRIORITY)
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      // High-Value Dispute for Ananya Jewellers (INR 45,000 - Scenario 5 / 8)
      {
        id: 'dsp-6',
        merchant_id: 'merch-7',
        txn_id: 'txn-6',
        amount: 45000,
        status: 'NEW',
        reason: 'Customer claims unauthorized international luxury card transaction',
        due_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      // Dispute Won & Lost examples
      {
        id: 'dsp-7',
        merchant_id: 'merch-3',
        txn_id: 'txn-7',
        amount: 18500,
        status: 'WON',
        reason: 'Customer claimed damaged TV delivered; merchant provided unboxing CCTV',
        due_at: new Date(Date.now() - 864000000).toISOString(),
        created_at: new Date(Date.now() - 1728000000).toISOString(),
      },
      {
        id: 'dsp-8',
        merchant_id: 'merch-2',
        txn_id: 'txn-8',
        amount: 4200,
        status: 'LOST',
        reason: 'No proof submitted within 7-day statutory bank SLA',
        due_at: new Date(Date.now() - 432000000).toISOString(),
        created_at: new Date(Date.now() - 1296000000).toISOString(),
      },
    ];

    // 6. Evidence for Ramesh DSP-1
    this.state.evidence = [
      {
        id: 'evi-1',
        dispute_id: 'dsp-1',
        file_url: 'https://storage.paytm.com/evidence/ramesh_delivery_slip_102.pdf',
        kind: 'signed_delivery_receipt',
        uploaded_by: 'usr-m-1',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'evi-2',
        dispute_id: 'dsp-3',
        file_url: 'https://storage.paytm.com/evidence/ramesh_pos_terminal_charge_receipt.pdf',
        kind: 'pos_charge_slip',
        uploaded_by: 'usr-m-1',
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    // 7. Seed Cases
    this.state.cases = [
      {
        id: 'case-1',
        merchant_id: 'merch-1',
        type: 'settlement_failed',
        priority: 'high',
        status: 'open',
        assigned_to: 'usr-sys-1',
        summary: 'Payout of ₹4,735.54 failed due to invalid IFSC branch code after merger. Awaiting payout re-initiation.',
        settlement_id: 'stl-2',
        opened_at: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'case-2',
        merchant_id: 'merch-7',
        type: 'dispute',
        priority: 'high',
        status: 'needs_approval',
        assigned_to: 'usr-mgr-1',
        summary: 'High-value chargeback of ₹45,000 against international card. Agent prepared ready-to-decide pack for Ops Manager review.',
        dispute_id: 'dsp-6',
        opened_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'case-3',
        merchant_id: 'merch-1',
        type: 'settlement_deduction',
        priority: 'high',
        status: 'needs_approval',
        assigned_to: 'usr-ops-1',
        summary: 'Settlement reconciliation mismatch: Net recorded ₹41,200 vs component tally ₹43,320 (Difference ₹2,120). Escalated to Ops Agent.',
        settlement_id: 'stl-5',
        opened_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    // 7.5 Seed Messages for initial cases (Realistic merchant & agent conversations)
    this.state.messages = [
      // Case 1: Ramesh Kirana Store - Failed settlement
      {
        id: 'msg-seed-1',
        case_id: 'case-1',
        sender: 'merchant',
        text: 'Mera kal ka settlement abhi tak nahi aaya, ₹4,735.54 pending dikha raha hai.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 10200000).toISOString(),
      },
      {
        id: 'msg-seed-2',
        case_id: 'case-1',
        sender: 'agent',
        text: 'Namaste Ramesh ji! Maine live gateway check kiya hai. Aapka ₹4,735.54 ka payout bank IFSC code change (branch merger) ke kaaran reject hua tha. Updated IFSC confirm karne ke baad payout re-initiation process shuru ho chuka hai.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 9600000).toISOString(),
      },

      // Case 2: Ananya Diamond & Gold - High Value Dispute (₹45,000)
      {
        id: 'msg-seed-3',
        case_id: 'case-2',
        sender: 'merchant',
        text: 'Hamare store par ₹45,000 ka international chargeback dispute aaya hai. Customer ne store mein aakar physical swipe kiya tha aur signed tax invoice bhi diya hai.',
        lang: 'hi',
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: 'msg-seed-4',
        case_id: 'case-2',
        sender: 'agent',
        text: 'नमस्ते अनन्या जी, मैंने विवाद #dsp-6 (राशि: ₹45,000) का विवरण प्राप्त कर लिया है। आपका अपलोड किया गया बायोमेट्रिक टैक्स इनवॉइस और सीसीटीवी फुटेज रक्षा (Defence) हेतु संलग्न कर दिया गया है। चूंकि राशि ₹25,000 से अधिक है, मैंने नीति अनुसार Ops Manager समीक्षा के लिए Ready-to-Decide Pack तैयार कर दिया है।',
        lang: 'hi',
        created_at: new Date(Date.now() - 3200000).toISOString(),
      },
      {
        id: 'msg-seed-5',
        case_id: 'case-2',
        sender: 'merchant',
        text: 'Kripya isse jaldi process karwayein kyunki bank SLA 4 dino mein expire ho raha hai.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 2800000).toISOString(),
      },
      {
        id: 'msg-seed-6',
        case_id: 'case-2',
        sender: 'agent',
        text: 'Bilkul Ananya ji, case ko High Priority mark kiya gaya hai aur Ops Manager Neha Gupta ke approval queue mein topmost place kiya gaya hai. Approval milte hi bank ko representment file dispatch ho jayegi.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 2500000).toISOString(),
      },

      // Case 3: Ramesh Kirana Store - Reconciliation Mismatch (₹2,120)
      {
        id: 'msg-seed-7',
        case_id: 'case-3',
        sender: 'merchant',
        text: 'Mera pichle hafte ka settlement calculation match nahi ho raha hai. Total sales ₹50,000 thi par account mein sirf ₹41,200 aaya. Katauti ka hisaab theek nahi lag raha.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 7000000).toISOString(),
      },
      {
        id: 'msg-seed-8',
        case_id: 'case-3',
        sender: 'agent',
        text: 'Namaste Ramesh ji! Sulajh AI Reconciliation Engine ne aapka ledger tally kiya hai:\n• Gross Sales: ₹50,000\n• Commission (2%): -₹1,000\n• GST (18%): -₹180\n• Refunds: -₹2,500\n• Chargeback: -₹3,000\nExpected Net: ₹43,320\nRecorded Net: ₹41,200\n\nDifference: ₹2,120 unexplained mismatch detect hua hai. Maine investigation ke liye Ops Agent Vikram Singh ko escalate kar diya hai.',
        lang: 'hinglish',
        created_at: new Date(Date.now() - 6500000).toISOString(),
      },
    ];

    // 8. Seed Approvals (Decision pack for Case 2 & Case 3)
    this.state.approvals = [
      {
        id: 'appr-1',
        case_id: 'case-2',
        action: 'submit_dispute_defence',
        amount: 45000,
        requested_by: 'usr-sys-1',
        decision: 'pending',
        summary: 'Merchant Ananya Jewellers received ₹45,000 chargeback on international card. KYC and biometric store invoice uploaded.',
        evidence_ids: ['evi-1'],
        recommendation: 'Approve defence filing. Merchant is 5-star rated with <0.02% historical chargebacks.',
        risk_level: 'high',
        action_on_approve: 'Execute paytmGateway.submitDisputeAction(action=DEFEND) with uploaded CCTV and KYC evidence',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'appr-2',
        case_id: 'case-3',
        action: 'adjust_settlement_ledger',
        amount: 2120,
        requested_by: 'usr-sys-1',
        decision: 'pending',
        summary: 'Reconciliation discrepancy detected: Calculated net ₹43,320 vs ledger net ₹41,200. ₹2,120 difference requires credit adjustment.',
        evidence_ids: [],
        recommendation: 'Approve ₹2,120 compensatory ledger adjustment for merchant Ramesh Kirana Store after reconciling sponsor bank transaction log.',
        risk_level: 'low',
        action_on_approve: 'Credit ₹2,120 compensatory adjustment to Ramesh Kirana Store under Adjustment Code ADJ-REC-RECON',
        created_at: new Date(Date.now() - 7100000).toISOString(),
      },
    ];

    // Seed 15 historical approvals for policy suggestion demo
    for (let i = 1; i <= 15; i++) {
      this.state.approvals.push({
        id: `appr-hist-${i}`,
        case_id: 'case-1',
        action: 'reinitiate_payout',
        amount: 4000 + i * 50,
        requested_by: 'usr-sys-1',
        decided_by: 'usr-ops-1',
        decision: 'approved',
        reason: 'Verified account details with sponsor bank',
        summary: 'Payout re-initiation',
        recommendation: 'Approve',
        risk_level: 'low',
        action_on_approve: 'Reinitiate',
        decided_at: new Date(Date.now() - (16 - i) * 86400000).toISOString(),
        created_at: new Date(Date.now() - (16 - i) * 86400000).toISOString(),
      });
    }

    // 9. Policy Suggestion
    this.state.policy_suggestions = [
      {
        id: 'sugg-1',
        rule_key: 'agent_approval_limit',
        suggestion: 'Increase autonomous payout re-initiation limit from ₹5,000 to ₹7,500',
        evidence: 'Last 15 payout re-initiations between ₹4,000 and ₹5,000 were approved by Ops Agents with a 100% approval rate and zero subsequent fraud or chargeback incidents.',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // 10. Knowledge Base Chunks
    this.state.kb_chunks = [
      {
        id: 'kb-1',
        source: 'Paytm Settlement Policy Section 2.1',
        text: 'Settlement Cycles: Paytm operates standard T+1 settlements where yesterday transactions are credited by 10:00 AM on the next banking day. Same-day settlements occur in 3 batches: 12 PM, 4 PM, and 8 PM.',
      },
      {
        id: 'kb-2',
        source: 'Paytm Settlement Deductions Section 4.3',
        text: 'Net Settlement Calculation: Net Payout = Gross Sales - Payment Gateway Commission - 18% GST on Commission - Customer Refunds - Disputed Chargeback Deductions - Monthly Soundbox Rental Charges.',
      },
      {
        id: 'kb-3',
        source: 'Paytm Dispute Policy Section 1.2',
        text: 'Chargeback SLAs: When a customer files a dispute with their issuing bank, the merchant has a strict 7-calendar-day window to upload Proof of Delivery (POD) or an authorized tax invoice. Uncontested disputes are automatically debited.',
      },
      {
        id: 'kb-4',
        source: 'Paytm Bank Failure Codes Section 9.1',
        text: 'Bank Failure Code CBS-91 indicates a temporary core banking gateway timeout at the beneficiary bank. Automatic re-initiation is permitted once the sponsor bank clears the queue.',
      },
      {
        id: 'kb-5',
        source: 'Paytm Security & Money Limits Policy Section 5',
        text: 'Autonomous Agent Limits: The AI teammate Sulajh can autonomously execute payout re-initiations up to ₹5,000. Ops Agents can approve up to ₹25,000. Any payout or dispute above ₹25,000 requires Ops Manager approval.',
      },
    ];
  }
}

// Global singleton instance
export const db = new Database();

