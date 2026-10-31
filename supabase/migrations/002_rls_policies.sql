-- ============================================================================
-- Sulajh AI: Row Level Security (RLS) & Policies
-- Paytm Build for India Hackathon · Track 3: Autonomous AI Teammates
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_suggestions ENABLE ROW LEVEL SECURITY;

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

-- Get current authenticated user's ID
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::UUID;
$$ LANGUAGE sql STABLE;

-- Get current authenticated user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- Get current authenticated merchant's ID
CREATE OR REPLACE FUNCTION current_merchant_id()
RETURNS UUID AS $$
  SELECT m.id FROM merchants m WHERE m.user_id = current_user_id() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Check if current user is staff (ops_agent, ops_manager, admin, system_agent)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() IN ('ops_agent', 'ops_manager', 'admin', 'system_agent');
$$ LANGUAGE sql STABLE;

-- Check if current user is admin or system
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() IN ('admin', 'system_agent');
$$ LANGUAGE sql STABLE;

-- ─── USERS POLICIES ─────────────────────────────────────────────────────────

-- Users can read their own profile; staff can read all users
CREATE POLICY users_select ON users
  FOR SELECT USING (
    id = current_user_id() OR is_staff()
  );

-- Only admin can update users
CREATE POLICY users_update ON users
  FOR UPDATE USING (
    is_admin()
  );

-- ─── MERCHANTS POLICIES ─────────────────────────────────────────────────────

-- Merchant reads their own merchant record; staff reads all
CREATE POLICY merchants_select ON merchants
  FOR SELECT USING (
    user_id = current_user_id() OR is_staff()
  );

-- Admin can manage merchants
CREATE POLICY merchants_all ON merchants
  FOR ALL USING (
    is_admin()
  );

-- ─── SETTLEMENTS POLICIES ───────────────────────────────────────────────────

-- Merchant reads only their own settlements; staff reads all
CREATE POLICY settlements_select ON settlements
  FOR SELECT USING (
    merchant_id = current_merchant_id() OR is_staff()
  );

-- Only system agent or admin can insert/update settlements
CREATE POLICY settlements_modify ON settlements
  FOR ALL USING (
    is_admin()
  );

-- ─── TRANSACTIONS POLICIES ──────────────────────────────────────────────────

-- Merchant reads transactions linked to their settlements
CREATE POLICY transactions_select ON transactions
  FOR SELECT USING (
    settlement_id IN (SELECT id FROM settlements WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

-- ─── DISPUTES POLICIES ──────────────────────────────────────────────────────

-- Merchant reads only their own disputes; staff reads all
CREATE POLICY disputes_select ON disputes
  FOR SELECT USING (
    merchant_id = current_merchant_id() OR is_staff()
  );

-- Merchant can insert dispute responses (POD upload); staff can update
CREATE POLICY disputes_modify ON disputes
  FOR UPDATE USING (
    merchant_id = current_merchant_id() OR is_staff()
  );

-- ─── EVIDENCE POLICIES ──────────────────────────────────────────────────────

-- Merchant reads/uploads evidence for their disputes; staff can read all
CREATE POLICY evidence_select ON evidence
  FOR SELECT USING (
    dispute_id IN (SELECT id FROM disputes WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

CREATE POLICY evidence_insert ON evidence
  FOR INSERT WITH CHECK (
    dispute_id IN (SELECT id FROM disputes WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

-- ─── CASES POLICIES ─────────────────────────────────────────────────────────

-- Merchant sees only their own cases; staff sees all
CREATE POLICY cases_select ON cases
  FOR SELECT USING (
    merchant_id = current_merchant_id() OR is_staff()
  );

CREATE POLICY cases_insert ON cases
  FOR INSERT WITH CHECK (
    merchant_id = current_merchant_id() OR is_staff()
  );

CREATE POLICY cases_update ON cases
  FOR UPDATE USING (
    is_staff()
  );

-- ─── MESSAGES POLICIES ──────────────────────────────────────────────────────

-- Merchant reads messages on their cases; staff reads all
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    case_id IN (SELECT id FROM cases WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    case_id IN (SELECT id FROM cases WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

-- ─── AGENT STEPS POLICIES ───────────────────────────────────────────────────

-- Merchant cannot directly read raw agent steps; staff can read all
CREATE POLICY agent_steps_select ON agent_steps
  FOR SELECT USING (
    is_staff()
  );

CREATE POLICY agent_steps_insert ON agent_steps
  FOR INSERT WITH CHECK (
    is_staff()
  );

-- ─── APPROVALS POLICIES ─────────────────────────────────────────────────────

-- Only staff can read and modify approvals
CREATE POLICY approvals_select ON approvals
  FOR SELECT USING (
    is_staff()
  );

CREATE POLICY approvals_modify ON approvals
  FOR ALL USING (
    is_staff()
  );

-- ─── POLICIES TABLE (Limits & rules) ────────────────────────────────────────

-- Everyone can read active policies; only admin can edit
CREATE POLICY policies_select ON policies
  FOR SELECT USING (true);

CREATE POLICY policies_admin ON policies
  FOR ALL USING (
    is_admin()
  );

-- ─── AUDIT LOG POLICIES ─────────────────────────────────────────────────────

-- Admin and Ops Manager can read audit log; append-only for everyone
CREATE POLICY audit_select ON audit_log
  FOR SELECT USING (
    current_user_role() IN ('ops_manager', 'admin', 'system_agent')
  );

CREATE POLICY audit_insert ON audit_log
  FOR INSERT WITH CHECK (true);

-- ─── INCIDENTS POLICIES ─────────────────────────────────────────────────────

-- Everyone can read incidents; staff can create/modify
CREATE POLICY incidents_select ON incidents
  FOR SELECT USING (true);

CREATE POLICY incidents_modify ON incidents
  FOR ALL USING (
    is_staff()
  );

-- ─── ANSWER SOURCES POLICIES ────────────────────────────────────────────────

-- Merchant reads answer sources for their cases; staff reads all
CREATE POLICY answer_sources_select ON answer_sources
  FOR SELECT USING (
    case_id IN (SELECT id FROM cases WHERE merchant_id = current_merchant_id())
    OR is_staff()
  );

CREATE POLICY answer_sources_insert ON answer_sources
  FOR INSERT WITH CHECK (true);

-- ─── POLICY SUGGESTIONS POLICIES ───────────────────────────────────────────

-- Ops Manager and Admin read/update policy suggestions
CREATE POLICY policy_suggestions_select ON policy_suggestions
  FOR SELECT USING (
    current_user_role() IN ('ops_manager', 'admin', 'system_agent')
  );

CREATE POLICY policy_suggestions_update ON policy_suggestions
  FOR UPDATE USING (
    is_admin()
  );

