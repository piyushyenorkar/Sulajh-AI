-- ============================================================================
-- Sulajh AI: Initial Database Schema
-- Paytm Build for India Hackathon · Track 3: Autonomous AI Teammates
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ─────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('merchant', 'ops_agent', 'ops_manager', 'admin', 'system_agent');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'needs_approval', 'resolved', 'escalated', 'closed');
CREATE TYPE case_type AS ENUM ('settlement_failed', 'settlement_delayed', 'settlement_deduction', 'dispute', 'general');
CREATE TYPE dispute_status AS ENUM ('NEW', 'POD_UPLOAD', 'POD_REJECT', 'WON', 'LOST');
CREATE TYPE settlement_status AS ENUM ('initiated', 'processing', 'paid', 'failed', 'delayed');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE approval_decision AS ENUM ('approved', 'rejected', 'pending');
CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE message_sender AS ENUM ('merchant', 'agent', 'staff');
CREATE TYPE actor_type AS ENUM ('merchant', 'ops_agent', 'ops_manager', 'admin', 'system_agent');
CREATE TYPE event_type AS ENUM ('settlement_failed', 'settlement_delayed', 'dispute_opened', 'dispute_due_soon', 'bank_outage');
CREATE TYPE language_pref AS ENUM ('hi', 'en', 'hinglish', 'mr');

-- ─── USERS ──────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL DEFAULT 'merchant',
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ─── MERCHANTS ──────────────────────────────────────────────────────────────

CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  language language_pref NOT NULL DEFAULT 'hinglish',
  bank_last4 TEXT NOT NULL DEFAULT '0000',
  risk_flag BOOLEAN NOT NULL DEFAULT false,
  phone_masked TEXT NOT NULL DEFAULT 'XXXX',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_user_id ON merchants(user_id);

-- ─── SETTLEMENTS ────────────────────────────────────────────────────────────

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  cycle TEXT NOT NULL DEFAULT 'T+1',
  gross NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst NUMERIC(12,2) NOT NULL DEFAULT 0,
  refunds NUMERIC(12,2) NOT NULL DEFAULT 0,
  chargebacks NUMERIC(12,2) NOT NULL DEFAULT 0,
  recoveries NUMERIC(12,2) NOT NULL DEFAULT 0,
  adjustments NUMERIC(12,2) NOT NULL DEFAULT 0,
  net NUMERIC(12,2) NOT NULL DEFAULT 0,
  status settlement_status NOT NULL DEFAULT 'initiated',
  expected_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_merchant ON settlements(merchant_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_created ON settlements(created_at);

-- ─── TRANSACTIONS ───────────────────────────────────────────────────────────

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  mode TEXT NOT NULL DEFAULT 'upi',
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_settlement ON transactions(settlement_id);

-- ─── DISPUTES ───────────────────────────────────────────────────────────────

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  txn_id UUID REFERENCES transactions(id),
  amount NUMERIC(12,2) NOT NULL,
  status dispute_status NOT NULL DEFAULT 'NEW',
  reason TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_due ON disputes(due_at);

-- ─── EVIDENCE ───────────────────────────────────────────────────────────────

CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'delivery_proof',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INCIDENTS ──────────────────────────────────────────────────────────────

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cause TEXT NOT NULL,
  bank TEXT,
  status incident_status NOT NULL DEFAULT 'open',
  merchant_count INTEGER NOT NULL DEFAULT 0,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ─── CASES ──────────────────────────────────────────────────────────────────

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  type case_type NOT NULL DEFAULT 'general',
  priority priority_level NOT NULL DEFAULT 'medium',
  status case_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  summary TEXT,
  incident_id UUID REFERENCES incidents(id),
  settlement_id UUID REFERENCES settlements(id),
  dispute_id UUID REFERENCES disputes(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_cases_merchant ON cases(merchant_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created ON cases(opened_at);

-- ─── MESSAGES ───────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  text TEXT NOT NULL,
  lang language_pref NOT NULL DEFAULT 'hinglish',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_case ON messages(case_id);

-- ─── AGENT STEPS ────────────────────────────────────────────────────────────

CREATE TABLE agent_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_no INTEGER NOT NULL,
  tool TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  policy_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_steps_case ON agent_steps(case_id);

-- ─── APPROVALS ──────────────────────────────────────────────────────────────

CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  requested_by UUID NOT NULL REFERENCES users(id),
  decided_by UUID REFERENCES users(id),
  decision approval_decision NOT NULL DEFAULT 'pending',
  reason TEXT,
  summary TEXT,
  evidence_ids UUID[] DEFAULT '{}',
  recommendation TEXT,
  risk_level risk_level DEFAULT 'medium',
  action_on_approve TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approvals_case ON approvals(case_id);
CREATE INDEX idx_approvals_decision ON approvals(decision);

-- ─── POLICIES ───────────────────────────────────────────────────────────────

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_key ON policies(key);

-- ─── AUDIT LOG (APPEND-ONLY) ────────────────────────────────────────────────

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type actor_type NOT NULL,
  actor_id UUID NOT NULL,
  case_id UUID REFERENCES cases(id),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_audit_ts ON audit_log(ts);
CREATE INDEX idx_audit_case ON audit_log(case_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_action ON audit_log(action);

-- Append-only: block UPDATE and DELETE on audit_log
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: UPDATE and DELETE are forbidden';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ─── EVENTS ─────────────────────────────────────────────────────────────────

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type event_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_processed ON events(processed);
CREATE INDEX idx_events_type ON events(type);

-- ─── KB CHUNKS ──────────────────────────────────────────────────────────────

CREATE TABLE kb_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding_ref TEXT
);

-- ─── ANSWER SOURCES ─────────────────────────────────────────────────────────

CREATE TABLE answer_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id),
  step_id UUID REFERENCES agent_steps(id),
  record_ref TEXT NOT NULL,
  rule_key TEXT
);

-- ─── POLICY SUGGESTIONS ────────────────────────────────────────────────────

CREATE TABLE policy_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  evidence TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

