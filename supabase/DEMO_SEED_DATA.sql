-- ============================================================================
-- Sulajh AI: Standalone Demo Seed Data Script (for Supabase SQL Editor)
-- Use this script anytime to WIPE and RE-INJECT clean demo data in Supabase.
-- Note: Tables and RLS policies must already exist (from SETUP_ALL_IN_ONE.sql).
-- ============================================================================

-- ─── 0. CLEAN EXISTING DATA (Reverse Dependency Order) ───────────────────────
TRUNCATE TABLE answer_sources CASCADE;
TRUNCATE TABLE policy_suggestions CASCADE;
TRUNCATE TABLE kb_chunks CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE agent_steps CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE approvals CASCADE;
TRUNCATE TABLE cases CASCADE;
TRUNCATE TABLE incidents CASCADE;
TRUNCATE TABLE evidence CASCADE;
TRUNCATE TABLE disputes CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE settlements CASCADE;
TRUNCATE TABLE merchants CASCADE;
TRUNCATE TABLE policies CASCADE;
TRUNCATE TABLE users CASCADE;

-- ─── 1. POLICIES (Safety Guardrails) ─────────────────────────────────────────
INSERT INTO policies (id, version, key, value, active, created_at) VALUES
  ('11111111-1111-1111-1111-111111110001', 1, 'agent_approval_limit', '5000', true, NOW()),
  ('11111111-1111-1111-1111-111111110002', 1, 'ops_agent_approval_limit', '25000', true, NOW()),
  ('11111111-1111-1111-1111-111111110003', 1, 'merchant_daily_payout_cap', '50000', true, NOW()),
  ('11111111-1111-1111-1111-111111110004', 1, 'incident_failure_threshold', '5', true, NOW()),
  ('11111111-1111-1111-1111-111111110005', 1, 'incident_window_minutes', '60', true, NOW()),
  ('11111111-1111-1111-1111-111111110006', 1, 'max_agent_steps', '8', true, NOW()),
  ('11111111-1111-1111-1111-111111110007', 1, 'max_payout_reinitiations_per_case', '2', true, NOW());

-- ─── 2. USERS (Staff & Merchants) ────────────────────────────────────────────
-- Staff
INSERT INTO users (id, role, name, email, phone, active, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Piyush Admin', 'piyush.admin@paytm.com', '+919999900001', true, NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'ops_manager', 'Neha Gupta (Ops Manager)', 'neha.manager@paytm.com', '+919999900002', true, NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'ops_agent', 'Vikram Singh (Ops Agent)', 'vikram.ops@paytm.com', '+919999900003', true, NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'system_agent', 'Sulajh AI Engine', 'engine@sulajh.ai', NULL, true, NOW());

-- 8 Merchants
INSERT INTO users (id, role, name, email, phone, active, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'merchant', 'Ramesh Kumar', 'ramesh@kirana.in', '+919876543210', true, NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'merchant', 'Priya Sharma', 'priya@boutique.in', '+919811223344', true, NOW()),
  ('b0000000-0000-0000-0000-000000000003', 'merchant', 'Ganesh Patil', 'ganesh@electronics.in', '+919822334455', true, NOW()),
  ('b0000000-0000-0000-0000-000000000004', 'merchant', 'Sunil Sharma', 'sunil@sharmasweets.in', '+919833445566', true, NOW()),
  ('b0000000-0000-0000-0000-000000000005', 'merchant', 'Simran Kaur', 'simran@modernsalon.in', '+919844556677', true, NOW()),
  ('b0000000-0000-0000-0000-000000000006', 'merchant', 'Rajesh Verma', 'rajesh@vermasuper.in', '+919855667788', true, NOW()),
  ('b0000000-0000-0000-0000-000000000007', 'merchant', 'Ananya Mehta', 'ananya@jewellers.in', '+919866778899', true, NOW()),
  ('b0000000-0000-0000-0000-000000000008', 'merchant', 'Dinesh Deshmukh', 'dinesh@deccanmobile.in', '+919877889900', true, NOW());

-- ─── 3. MERCHANTS ────────────────────────────────────────────────────────────
INSERT INTO merchants (id, user_id, business_name, language, bank_last4, risk_flag, phone_masked, category, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Ramesh Kirana Store', 'hinglish', '4821', false, 'XXXX-XX3210', 'Grocery / Kirana', NOW() - INTERVAL '60 days'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Priya Ethnic Boutique', 'hi', '1092', false, 'XXXX-XX3344', 'Apparel / Fashion', NOW() - INTERVAL '90 days'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Ganesh Electronics', 'mr', '7734', false, 'XXXX-XX4455', 'Electronics', NOW() - INTERVAL '120 days'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Sharma Sweets & Cafe', 'hi', '6612', false, 'XXXX-XX5566', 'Food & Beverage', NOW() - INTERVAL '150 days'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Modern Salon & Spa', 'hinglish', '8823', false, 'XXXX-XX6677', 'Personal Care', NOW() - INTERVAL '45 days'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Verma Supermarket', 'hinglish', '3341', false, 'XXXX-XX7788', 'Supermarket', NOW() - INTERVAL '180 days'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Ananya Diamond & Gold', 'hi', '9901', true, 'XXXX-XX8899', 'Jewellery', NOW() - INTERVAL '200 days'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Deccan Mobile Care', 'mr', '5512', false, 'XXXX-XX9900', 'Mobile Services', NOW() - INTERVAL '30 days');

-- ─── 4. SETTLEMENTS ──────────────────────────────────────────────────────────
INSERT INTO settlements (id, merchant_id, cycle, gross, commission, gst, refunds, chargebacks, recoveries, adjustments, net, status, expected_at, paid_at, failure_reason, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'T+1', 12500.00, 250.00, 45.00, 0.00, 0.00, 0.00, 0.00, 12205.00, 'paid', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', NULL, NOW() - INTERVAL '1 day'),
  -- Failed Payout (IFSC changed)
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'T+1', 4850.00, 97.00, 17.46, 0.00, 0.00, 0.00, 0.00, 4735.54, 'failed', NOW() - INTERVAL '4 hours', NULL, 'Beneficiary bank rejected transaction: IFSC code changed due to bank branch merger', NOW() - INTERVAL '4 hours'),
  -- Delayed Payout
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'same-day', 18200.00, 364.00, 65.52, 0.00, 0.00, 0.00, 0.00, 17770.48, 'delayed', NOW() - INTERVAL '3 hours', NULL, 'NPCI/IMPS clearing switch delay at sponsor bank. Expected clearance within 45 minutes.', NOW() - INTERVAL '3 hours'),
  -- Heavy Deductions
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'T+1', 10000.00, 200.00, 36.00, 250.00, 100.00, 0.00, 125.00, 9289.00, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days'),
  -- Deliberate Mismatch (₹2,120 discrepancy)
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'T+1', 50000.00, 1000.00, 180.00, 2500.00, 3000.00, 0.00, 0.00, 41200.00, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '5 days'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'T+1', 34000.00, 680.00, 122.40, 0.00, 0.00, 0.00, 0.00, 33197.60, 'paid', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NOW() - INTERVAL '1 day'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'T+1', 82000.00, 1640.00, 295.20, 1500.00, 0.00, 0.00, 0.00, 78564.80, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'T+1', 21500.00, 430.00, 77.40, 0.00, 0.00, 0.00, 0.00, 20992.60, 'paid', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NOW() - INTERVAL '1 day'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 'same-day', 14200.00, 284.00, 51.12, 0.00, 0.00, 0.00, 0.00, 13864.88, 'paid', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NOW() - INTERVAL '1 day'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000006', 'T+1', 65000.00, 1300.00, 234.00, 2000.00, 1500.00, 0.00, 0.00, 59966.00, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '3 days');

-- ─── 5. DISPUTES ─────────────────────────────────────────────────────────────
INSERT INTO disputes (id, merchant_id, txn_id, amount, status, reason, due_at, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, 1200.00, 'POD_UPLOAD', 'Customer claims items missing from order #8812', NOW() + INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', NULL, 3400.00, 'NEW', 'Customer disputes duplicate transaction charge', NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', NULL, 8500.00, 'POD_UPLOAD', 'Customer disputes card charge: services not rendered', NOW() + INTERVAL '5 days', NOW() - INTERVAL '2 days'),
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', NULL, 650.00, 'NEW', 'Incorrect amount billed at POS checkout', NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', NULL, 14000.00, 'POD_REJECT', 'Bank rejected submitted tax invoice: signature missing', NOW() + INTERVAL '1 day', NOW() - INTERVAL '4 days'),
  ('e0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000007', NULL, 45000.00, 'NEW', 'Customer claims unauthorized international card charge', NOW() + INTERVAL '4 days', NOW() - INTERVAL '2 days'),
  ('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', NULL, 18500.00, 'WON', 'Customer claimed damaged TV delivered; merchant provided unboxing CCTV', NOW() - INTERVAL '10 days', NOW() - INTERVAL '20 days'),
  ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', NULL, 4200.00, 'LOST', 'No proof submitted within 7-day statutory bank SLA', NOW() - INTERVAL '5 days', NOW() - INTERVAL '15 days'),
  ('e0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', NULL, 850.00, 'WON', 'Order delivered via Dunzo with OTP confirmation', NOW() - INTERVAL '8 days', NOW() - INTERVAL '16 days'),
  ('e0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000006', NULL, 28000.00, 'NEW', 'Customer claims high-value grocery order was short-delivered', NOW() + INTERVAL '3 days', NOW() - INTERVAL '1 day');

-- ─── 6. CASES ────────────────────────────────────────────────────────────────
INSERT INTO cases (id, merchant_id, type, priority, status, assigned_to, summary, settlement_id, dispute_id, opened_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'settlement_failed', 'high', 'open', 'a0000000-0000-0000-0000-000000000004', 'Payout of ₹4,735.54 failed due to invalid IFSC branch code after merger. Awaiting payout re-initiation.', 'd0000000-0000-0000-0000-000000000002', NULL, NOW() - INTERVAL '3 hours'),
  ('10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'dispute', 'high', 'needs_approval', 'a0000000-0000-0000-0000-000000000002', 'High-value chargeback of ₹45,000 against international card. Agent prepared decision pack for Ops Manager review.', NULL, 'e0000000-0000-0000-0000-000000000006', NOW() - INTERVAL '1 hour'),
  ('10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'settlement_deduction', 'high', 'needs_approval', 'a0000000-0000-0000-0000-000000000003', 'Settlement reconciliation mismatch: Net recorded ₹41,200 vs component tally ₹43,320 (Difference ₹2,120). Escalated to Ops Agent.', 'd0000000-0000-0000-0000-000000000005', NULL, NOW() - INTERVAL '2 hours');

-- ─── 7. APPROVALS (Decision Packs) ───────────────────────────────────────────
INSERT INTO approvals (id, case_id, action, amount, requested_by, decided_by, decision, reason, summary, recommendation, risk_level, action_on_approve, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'submit_dispute_defence', 45000.00, 'a0000000-0000-0000-0000-000000000004', NULL, 'pending', NULL, 'Merchant Ananya Jewellers received ₹45,000 chargeback on international card. KYC and biometric store invoice uploaded.', 'Approve defence filing. Merchant is 5-star rated with <0.02% historical chargebacks.', 'high', 'Execute paytmGateway.submitDisputeAction(action=DEFEND) with uploaded CCTV and KYC evidence', NOW() - INTERVAL '1 hour'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'adjust_settlement_reconciliation', 2120.00, 'a0000000-0000-0000-0000-000000000004', NULL, 'pending', NULL, 'Settlement discrepancy detected between component ledger and payout transaction.', 'Credit adjustment of ₹2,120 to merchant account.', 'medium', 'Execute adjustment payout of ₹2,120', NOW() - INTERVAL '2 hours');

-- ─── 8. MESSAGES (Seeded Conversation Timelines) ─────────────────────────────
INSERT INTO messages (id, case_id, sender, text, lang, created_at) VALUES
  -- Case 1 Conversation
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'merchant', 'Mera kal ka settlement abhi tak nahi aaya, kitna time lagega?', 'hinglish', NOW() - INTERVAL '45 minutes'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'agent', 'Namaste Ramesh ji! Maine check kiya hai. Aapka ₹4,735.54 ka payout beneficiary bank IFSC code invalid hone ki wajah se fail hua tha. Main ise abhi reinitiate kar raha hoon.', 'hinglish', NOW() - INTERVAL '44 minutes'),

  -- Case 2 Conversation (Ananya Jewellers ₹45,000 dispute)
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'merchant', 'Maine ₹45,000 ka gold pendant becha tha, customer ne international card se payment kiya. Ab bank chargeback dikha raha hai!', 'hinglish', NOW() - INTERVAL '50 minutes'),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'agent', 'Namaste Ananya ji. Ghabraiye mat, international card chargebacks ke liye hum bank ko Proof of Delivery aur Tax Invoice submit kar sakte hain. Kripya receipt upload karein.', 'hinglish', NOW() - INTERVAL '48 minutes'),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'merchant', 'Maine invoice aur courier delivery slip upload kar diya hai. Bank SLA 24 ghante mein khatam ho raha hai, jaldi kariye!', 'hinglish', NOW() - INTERVAL '40 minutes'),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'agent', 'Dono documents verify ho gaye hain. Kyunki amount ₹45,000 hai jo hamari ₹5,000 autonomous limit se upar hai, maine Ready-to-Decide Pack Ops Manager ko bhej diya hai.', 'hinglish', NOW() - INTERVAL '38 minutes'),

  -- Case 3 Conversation (Reconciliation mismatch)
  ('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'merchant', 'Mera settlement hisaab match nahi ho raha hai. Total bikri se ₹2,120 kam aaye hain!', 'hinglish', NOW() - INTERVAL '90 minutes'),
  ('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'agent', 'Maine aapke gross sales, commission, GST aur adjustments ka reconciliation calculate kiya. Recorded net ₹41,200 hai jabki tally ₹43,320 banti hai. ₹2,120 discrepancy flag karke Ops Agent ko bhej di gayi hai.', 'hinglish', NOW() - INTERVAL '88 minutes');

-- ─── 9. POLICY SUGGESTIONS ───────────────────────────────────────────────────
INSERT INTO policy_suggestions (id, rule_key, suggestion, evidence, status, created_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 'agent_approval_limit', 'Increase autonomous payout re-initiation limit from ₹5,000 to ₹7,500', 'Last 15 payout re-initiations between ₹4,000 and ₹5,000 were approved by Ops Agents with a 100% approval rate and zero subsequent fraud or chargeback incidents.', 'pending', NOW() - INTERVAL '1 day');

-- ─── 10. KNOWLEDGE BASE CHUNKS ───────────────────────────────────────────────
INSERT INTO kb_chunks (id, source, text) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Paytm Settlement Policy Section 2.1', 'Settlement Cycles: Paytm operates standard T+1 settlements where yesterday''s transactions are credited by 10:00 AM on the next banking day. Same-day settlements occur in 3 batches: 12 PM, 4 PM, and 8 PM.'),
  ('40000000-0000-0000-0000-000000000002', 'Paytm Settlement Deductions Section 4.3', 'Net Settlement Calculation: Net Payout = Gross Sales - Payment Gateway Commission - 18% GST on Commission - Customer Refunds - Disputed Chargeback Deductions - Monthly Soundbox Rental Charges.'),
  ('40000000-0000-0000-0000-000000000003', 'Paytm Dispute Policy Section 1.2', 'Chargeback SLAs: When a customer files a dispute with their issuing bank, the merchant has a strict 7-calendar-day window to upload Proof of Delivery (POD) or an authorized tax invoice. Uncontested disputes are automatically debited.'),
  ('40000000-0000-0000-0000-000000000004', 'Paytm Bank Failure Codes Section 9.1', 'Bank Failure Code CBS-91 indicates a temporary core banking gateway timeout at the beneficiary bank. Automatic re-initiation is permitted once the sponsor bank clears the queue.');

