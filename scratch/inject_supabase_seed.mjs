import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/api/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function injectMissingMessagesAndApprovals() {
  console.log('Inserting seed messages into live Supabase...');
  
  const messages = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      case_id: '10000000-0000-0000-0000-000000000001',
      sender: 'merchant',
      text: 'Mera kal ka settlement abhi tak nahi aaya, kitna time lagega?',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      case_id: '10000000-0000-0000-0000-000000000001',
      sender: 'agent',
      text: 'Namaste Ramesh ji! Maine check kiya hai. Aapka ₹4,735.54 ka payout beneficiary bank IFSC code invalid hone ki wajah se fail hua tha. Main ise abhi reinitiate kar raha hoon.',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      case_id: '10000000-0000-0000-0000-000000000002',
      sender: 'merchant',
      text: 'Maine ₹45,000 ka gold pendant becha tha, customer ne international card se payment kiya. Ab bank chargeback dikha raha hai!',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      case_id: '10000000-0000-0000-0000-000000000002',
      sender: 'agent',
      text: 'Namaste Ananya ji. Ghabraiye mat, international card chargebacks ke liye hum bank ko Proof of Delivery aur Tax Invoice submit kar sakte hain. Kripya receipt upload karein.',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000005',
      case_id: '10000000-0000-0000-0000-000000000002',
      sender: 'merchant',
      text: 'Maine invoice aur courier delivery slip upload kar diya hai. Bank SLA 24 ghante mein khatam ho raha hai, jaldi kariye!',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000006',
      case_id: '10000000-0000-0000-0000-000000000002',
      sender: 'agent',
      text: 'Dono documents verify ho gaye hain. Kyunki amount ₹45,000 hai jo hamari ₹5,000 autonomous limit se upar hai, maine Ready-to-Decide Pack Ops Manager ko bhej diya hai.',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000007',
      case_id: '10000000-0000-0000-0000-000000000003',
      sender: 'merchant',
      text: 'Mera settlement hisaab match nahi ho raha hai. Total bikri se ₹2,120 kam aaye hain!',
      lang: 'hinglish',
    },
    {
      id: '50000000-0000-0000-0000-000000000008',
      case_id: '10000000-0000-0000-0000-000000000003',
      sender: 'agent',
      text: 'Maine aapke gross sales, commission, GST aur adjustments ka reconciliation calculate kiya. Recorded net ₹41,200 hai jabki tally ₹43,320 banti hai. ₹2,120 discrepancy flag karke Ops Agent ko bhej di gayi hai.',
      lang: 'hinglish',
    }
  ];

  const { error: msgErr } = await supabase.from('messages').upsert(messages);
  if (msgErr) {
    console.error('Error inserting messages:', msgErr.message);
  } else {
    console.log(`Successfully inserted ${messages.length} messages into live Supabase!`);
  }

  // Insert approval for case-3
  const appr2 = {
    id: '20000000-0000-0000-0000-000000000011',
    case_id: '10000000-0000-0000-0000-000000000003',
    action: 'adjust_settlement_reconciliation',
    amount: 2120.00,
    requested_by: 'a0000000-0000-0000-0000-000000000004',
    decision: 'pending',
    summary: 'Settlement discrepancy detected between component ledger and payout transaction.',
    recommendation: 'Credit adjustment of ₹2,120 to merchant account.',
    risk_level: 'medium',
    action_on_approve: 'Execute adjustment payout of ₹2,120'
  };

  const { error: apprErr } = await supabase.from('approvals').upsert([appr2]);
  if (apprErr) {
    console.error('Error inserting approval appr-2:', apprErr.message);
  } else {
    console.log('Successfully inserted approval for case-3 in Supabase!');
  }
}

injectMissingMessagesAndApprovals();

