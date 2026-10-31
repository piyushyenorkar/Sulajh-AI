// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role = 'merchant' | 'ops_agent' | 'ops_manager' | 'admin' | 'system_agent';

// ─── Case Statuses ───────────────────────────────────────────────────────────
export type CaseStatus = 'open' | 'in_progress' | 'needs_approval' | 'resolved' | 'escalated' | 'closed';

// ─── Case Types ──────────────────────────────────────────────────────────────
export type CaseType = 'settlement_failed' | 'settlement_delayed' | 'settlement_deduction' | 'dispute' | 'general';

// ─── Dispute Statuses ────────────────────────────────────────────────────────
export type DisputeStatus = 'NEW' | 'POD_UPLOAD' | 'POD_REJECT' | 'WON' | 'LOST';

// ─── Priority ────────────────────────────────────────────────────────────────
export type Priority = 'high' | 'medium' | 'low';

// ─── Approval Decisions ──────────────────────────────────────────────────────
export type ApprovalDecision = 'approved' | 'rejected' | 'pending';

// ─── Policy Result ───────────────────────────────────────────────────────────
export type PolicyResult = {
  result: 'allow' | 'needs_approval' | 'refuse';
  reason: string;
  requiredRole?: Role;
};

// ─── Settlement Status ───────────────────────────────────────────────────────
export type SettlementStatus = 'initiated' | 'processing' | 'paid' | 'failed' | 'delayed';

// ─── Event Types ─────────────────────────────────────────────────────────────
export type EventType =
  | 'settlement_failed'
  | 'settlement_delayed'
  | 'dispute_opened'
  | 'dispute_due_soon'
  | 'bank_outage';

// ─── Language ────────────────────────────────────────────────────────────────
export type Language = 'hi' | 'en' | 'hinglish' | 'mr';

// ─── Incident Status ─────────────────────────────────────────────────────────
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

// ─── Risk Level ──────────────────────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ─── Message Sender ──────────────────────────────────────────────────────────
export type MessageSender = 'merchant' | 'agent' | 'staff';

// ─── Actor Type (Audit) ──────────────────────────────────────────────────────
export type ActorType = 'merchant' | 'ops_agent' | 'ops_manager' | 'admin' | 'system_agent';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  role: Role;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  created_at: string;
}

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  language: Language;
  bank_last4: string;
  risk_flag: boolean;
  phone_masked: string;
  category: string;
}

export interface Settlement {
  id: string;
  merchant_id: string;
  cycle: string;
  gross: number;
  commission: number;
  gst: number;
  refunds: number;
  chargebacks: number;
  recoveries: number;
  adjustments: number;
  net: number;
  status: SettlementStatus;
  expected_at: string;
  paid_at?: string;
  failure_reason?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  settlement_id: string;
  amount: number;
  mode: string;
  status: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  merchant_id: string;
  txn_id: string;
  amount: number;
  status: DisputeStatus;
  reason: string;
  due_at: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  dispute_id: string;
  file_url: string;
  kind: string;
  uploaded_by: string;
  created_at: string;
}

export interface Case {
  id: string;
  merchant_id: string;
  type: CaseType;
  priority: Priority;
  status: CaseStatus;
  assigned_to?: string;
  summary?: string;
  incident_id?: string;
  settlement_id?: string;
  dispute_id?: string;
  opened_at: string;
  closed_at?: string;
}

export interface Message {
  id: string;
  case_id: string;
  sender: MessageSender;
  text: string;
  lang: Language;
  created_at: string;
}

export interface AgentStep {
  id: string;
  case_id: string;
  step_no: number;
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  policy_result?: PolicyResult;
  created_at: string;
}

export interface Approval {
  id: string;
  case_id: string;
  action: string;
  amount: number;
  requested_by: string;
  decided_by?: string;
  decision: ApprovalDecision;
  reason?: string;
  summary?: string;
  evidence_ids?: string[];
  recommendation?: string;
  risk_level?: RiskLevel;
  action_on_approve?: string;
  decided_at?: string;
  created_at: string;
}

export interface Policy {
  id: string;
  version: number;
  key: string;
  value: string;
  active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  ts: string;
  actor_type: ActorType;
  actor_id: string;
  case_id?: string;
  action: string;
  details: Record<string, unknown>;
}

export interface Event {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface KbChunk {
  id: string;
  source: string;
  text: string;
  embedding_ref?: string;
}

export interface Incident {
  id: string;
  cause: string;
  bank?: string;
  status: IncidentStatus;
  merchant_count: number;
  opened_at: string;
  closed_at?: string;
}

export interface AnswerSource {
  id: string;
  case_id: string;
  message_id: string;
  step_id: string;
  record_ref: string;
  rule_key?: string;
}

export interface PolicySuggestion {
  id: string;
  rule_key: string;
  suggestion: string;
  evidence: string;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface ChatRequest {
  text?: string;
  audio_url?: string;
  case_id?: string;
  lang?: Language;
}

export interface ChatResponse {
  reply: string;
  case_id: string;
  actions_taken: string[];
  answer_sources: AnswerSource[];
}

export interface DecisionRequest {
  decision: 'approved' | 'rejected';
  reason: string;
}

export interface ReconciliationResult {
  settlement_id: string;
  gross: number;
  deductions: {
    label: string;
    amount: number;
    record_ref: string;
  }[];
  expected_net: number;
  actual_net: number;
  matched: boolean;
  difference: number;
  unmatched_lines: string[];
}

export interface DisputePlan {
  dispute_id: string;
  priority: Priority;
  reasons: string[];
  next_action: string;
  deadline: string;
}
