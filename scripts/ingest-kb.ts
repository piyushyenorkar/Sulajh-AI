import 'dotenv/config';

interface DocItem {
  id: number;
  source: string;
  rule_key: string;
  topic: string;
  text: string;
}

export const PAYTM_KB_DOCS: DocItem[] = [
  {
    id: 1,
    source: 'Paytm Merchant Settlement Policy 2026, Section 2.1',
    rule_key: 'SETTLEMENT_CYCLE_DEFAULT',
    topic: 'Settlement Cycle',
    text: 'Paytm standard settlement cycle is T+1 business days. All transactions settled before 23:59:59 IST are processed in the next morning clearing batch between 06:00 AM and 09:00 AM directly to registered merchant bank accounts.',
  },
  {
    id: 2,
    source: 'Paytm Merchant Settlement Policy 2026, Section 2.4',
    rule_key: 'ON_DEMAND_PAYOUT',
    topic: 'Instant Settlement',
    text: 'On-Demand / Instant Payout is available 24x7 for eligible verified merchants. A nominal fee of 0.15% plus 18% GST applies. Payout is credited via IMPS/UPI within 15 minutes of request.',
  },
  {
    id: 3,
    source: 'Paytm Bank Clearing & NPCI Guidelines 2026, Sec 4',
    rule_key: 'PAYOUT_DELAY_BANK_SWITCH',
    topic: 'Settlement Delays',
    text: 'When national clearing switches (IMPS/NEFT/RTGS) experience technical lag or bank server congestion, settlements can be delayed up to 120 minutes. Status remains DELAYED until confirmed by partner bank.',
  },
  {
    id: 4,
    source: 'Paytm Settlement Operations Guide 2026, Rule 5',
    rule_key: 'FAILED_PAYOUT_IFSC',
    topic: 'Failed Settlement',
    text: 'Settlements fail primarily due to invalid IFSC codes following bank mergers, dormant accounts, or name mismatches. Once verified, failed payouts under INR 5,000 can be autonomously re-initiated by Sulajh AI.',
  },
  {
    id: 5,
    source: 'Paytm Merchant Tariff Schedule 2026, MDR Section',
    rule_key: 'MDR_COMMISSION_GST',
    topic: 'Deductions & Commission',
    text: 'Merchant Discount Rate (MDR) or platform fee is deducted per transaction based on payment mode (UPI: 0%, RuPay Debit: 0%, Credit Card: 1.99%, Netbanking: 1.5%). All platform commissions attract mandatory 18% Goods & Services Tax (GST).',
  },
  {
    id: 6,
    source: 'Paytm Dispute & Chargeback Manual 2026, Section 1',
    rule_key: 'CHARGEBACK_RECOVERY',
    topic: 'Dispute Deductions',
    text: 'When a cardholder files a chargeback through their issuing bank, the disputed amount is temporarily withheld or recovered from upcoming settlement cycles until proof of delivery (POD) is verified.',
  },
  {
    id: 7,
    source: 'Paytm Merchant Soundbox & POS Rental Terms, Cl 3',
    rule_key: 'DEVICE_RENTAL_DEDUCTION',
    topic: 'Soundbox Rental',
    text: 'Monthly Soundbox 4G device rental of INR 125 (+18% GST = INR 147.50) is automatically adjusted from the first settlement of each calendar month for active POS merchants.',
  },
  {
    id: 8,
    source: 'Paytm Dispute Resolution Rules 2026, Section 3.2',
    rule_key: 'DISPUTE_STATUSES',
    topic: 'Dispute Lifecycle',
    text: 'Paytm dispute lifecycle has exactly 5 official statuses: NEW (dispute opened), POD_UPLOAD (evidence submitted by merchant), POD_REJECT (proof rejected by bank), WON (dispute resolved in merchant favor), and LOST (debited from merchant).',
  },
  {
    id: 9,
    source: 'Paytm Dispute SLA Guidelines 2026, Section 4',
    rule_key: 'DISPUTE_DEADLINE_SLA',
    topic: 'Dispute Timelines',
    text: 'Merchants must submit Proof of Delivery (POD) or valid invoice within 7 calendar days of dispute notification. Failure to respond within the deadline results in default forfeiture and debit of the disputed sum.',
  },
  {
    id: 10,
    source: 'Paytm Money Safety Guardrails 2026, Limit A1',
    rule_key: 'AGENT_AUTONOMOUS_LIMIT',
    topic: 'Autonomous Payout Limit',
    text: 'Sulajh AI is strictly permitted to autonomously re-initiate failed payouts up to INR 5,000 per settlement, subject to a daily merchant limit of INR 50,000 and maximum 2 re-initiations per case.',
  },
  {
    id: 11,
    source: 'Paytm Money Safety Guardrails 2026, Limit A2',
    rule_key: 'OPS_AGENT_LIMIT',
    topic: 'L1 Ops Agent Limit',
    text: 'Paytm L1 Support Executives (Ops Agents) have authorization to approve payouts, refunds, and adjustments up to INR 25,000. Any transaction above INR 25,000 requires Ops Manager approval with 2FA.',
  },
  {
    id: 12,
    source: 'Paytm Anti-Fraud & Risk Guidelines 2026, Section 7',
    rule_key: 'LARGE_AMOUNT_ATTACK_DEFENSE',
    topic: 'Prompt Injection Defense',
    text: 'Requests for release of funds exceeding limits (e.g. INR 50,000) or claims of ownership in chat are never treated as verification. They are politely refused and escalated to the Ops Manager for identity verification.',
  },
  {
    id: 13,
    source: 'Paytm Reconciliation Protocol 2026, Sec 5.1',
    rule_key: 'RECONCILIATION_FORMULA',
    topic: 'Settlement Reconciliation',
    text: 'Net Settlement formula: Gross Sales - Commission - 18% GST on Commission - Customer Refunds - Chargeback Recoveries + Adjustments. If components do not match actual net credited, a discrepancy case is flagged to Ops.',
  },
  {
    id: 14,
    source: 'Paytm Incident Management Manual 2026, Section 8',
    rule_key: 'BANK_OUTAGE_INCIDENT',
    topic: 'Bank Outage Handling',
    text: 'When 5 or more settlements fail for the same destination bank within 60 minutes due to gateway downtime, Sulajh AI groups them into a single Incident. One broadcast notification is sent, and bulk retry is scheduled.',
  },
  {
    id: 15,
    source: 'Paytm Compliance & Regulatory Standards 2026, Auditing',
    rule_key: 'AUDIT_APPEND_ONLY',
    topic: 'Audit Trails',
    text: 'Every financial event, agent reasoning step, tool call, policy decision, and staff override is permanently recorded in an append-only audit log. Update and delete permissions are blocked for all roles.',
  },
  {
    id: 16,
    source: 'Paytm Customer Support Multilingual Norms 2026, Sec 2',
    rule_key: 'MULTILINGUAL_HINGLISH',
    topic: 'Language Support',
    text: 'Sulajh AI communicates primarily in Hindi and Hinglish for Indian kirana merchants, with full support for English and Marathi. Technical terms like settlement, payout, and dispute are kept familiar.',
  },
  {
    id: 17,
    source: 'Paytm Merchant Helpdesk: Bank Details Update 2026',
    rule_key: 'UPDATE_BANK_ACCOUNT',
    topic: 'Bank Account Modification',
    text: 'To change settlement bank accounts, merchants must verify ownership using Aadhaar OTP or netbanking penny drop verification. Once verified, pending failed settlements are re-routed to the new account.',
  },
  {
    id: 18,
    source: 'Paytm Merchant Dashboard: Dispute Evidence Guide 2026',
    rule_key: 'EVIDENCE_ACCEPTED_FORMATS',
    topic: 'Evidence Requirements',
    text: 'Accepted evidence for dispute defense includes: Courier POD receipt with customer signature, digital delivery log with OTP timestamp, CCTV footage stills, and tax invoice clearly stating buyer GSTIN/phone.',
  },
  {
    id: 19,
    source: 'Paytm Risk Mitigation: High Value Transactions 2026',
    rule_key: 'HIGH_VALUE_DISPUTE_DEFENSE',
    topic: 'High Value Disputes',
    text: 'Disputes exceeding INR 5,000 undergo dual-review. Sulajh AI prepares a Ready-to-Decide Pack containing summary, risk level, evidence links, and recommended response for 1-click Ops Manager approval.',
  },
  {
    id: 20,
    source: 'Paytm Merchant Guarantee 2026, Section 10',
    rule_key: 'MERCHANT_TRUST_GUARANTEE',
    topic: 'Merchant Trust',
    text: 'Paytm guarantees zero unauthorized deductions. Every rupee deducted from gross settlements is accounted for with transparent transaction references, tax breakup, and downloadable settlement invoices.',
  },
];

// 128-dimensional deterministic semantic embedding generator
function generateVector(text: string, dim = 128): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    const sign = (hash & 1) === 0 ? 1 : -1;
    vec[idx] += sign * (1 / (1 + Math.log(1 + i)));
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) vec[i] = Number((vec[i] / norm).toFixed(6));

  return vec;
}

async function ingest() {
  const url = process.env.QDRANT_URL!;
  const apiKey = process.env.QDRANT_API_KEY!;
  const collectionName = 'sulajh_kb';

  console.log(`📡 Connecting to Qdrant Cloud at: ${url}`);
  console.log(`📁 Target collection: ${collectionName}`);

  // 1. Create or check collection
  const checkRes = await fetch(`${url}/collections/${collectionName}`, {
    headers: { 'api-key': apiKey },
  });

  if (checkRes.status === 404) {
    console.log(`Creating collection ${collectionName}...`);
    const createRes = await fetch(`${url}/collections/${collectionName}`, {
      method: 'PUT',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: {
          size: 128,
          distance: 'Cosine',
        },
      }),
    });
    console.log('Collection created response:', createRes.status);
  } else {
    console.log(`Collection ${collectionName} already exists or returned status:`, checkRes.status);
  }

  // 2. Prepare points
  const points = PAYTM_KB_DOCS.map((doc) => ({
    id: doc.id,
    vector: generateVector(doc.text + ' ' + doc.topic + ' ' + doc.rule_key),
    payload: {
      source: doc.source,
      rule_key: doc.rule_key,
      topic: doc.topic,
      text: doc.text,
    },
  }));

  // 3. Upsert points into Qdrant
  console.log(`Uploading ${points.length} documents into Qdrant...`);
  const upsertRes = await fetch(`${url}/collections/${collectionName}/points`, {
    method: 'PUT',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ points }),
  });

  if (upsertRes.ok) {
    const data = await upsertRes.json() as any;
    console.log('✅ Qdrant Upsert SUCCESS:', data.status || 'OK');
  } else {
    console.error('❌ Qdrant Upsert failed:', upsertRes.status, await upsertRes.text());
  }

  // 4. Test search in Qdrant
  console.log('\n🔎 Testing vector search query: "settlement delay reason"...');
  const queryVec = generateVector('settlement delay reason');
  const searchRes = await fetch(`${url}/collections/${collectionName}/points/search`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector: queryVec,
      limit: 2,
      with_payload: true,
    }),
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json() as any;
    console.log('Search matches found:', searchData.result?.length);
    searchData.result?.forEach((r: any, idx: number) => {
      console.log(`[#${idx + 1}] Score: ${r.score.toFixed(4)} | Topic: ${r.payload?.topic} | Source: ${r.payload?.source}`);
      console.log(`     Text: ${r.payload?.text.slice(0, 80)}...`);
    });
  } else {
    console.error('Search test failed:', searchRes.status, await searchRes.text());
  }
}

ingest().catch(console.error);

