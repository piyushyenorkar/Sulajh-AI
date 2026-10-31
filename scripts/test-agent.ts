import 'dotenv/config';
import { agent } from '../apps/api/src/agent/core.js';
import { db } from '../apps/api/src/lib/db.js';

async function run() {
  const m = db.getMerchants()[0];
  const cases = db.getCases({ merchant_id: m.id });
  const c = cases[0];
  console.log('Merchant:', m.id, 'Case:', c.id);
  try {
    const res = await agent.run(c.id, 'Customer dispute aaya hai 8500 ka, proof submit karo', 'hinglish');
    console.log('AGENT RES:', JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error('AGENT ERROR:', err);
  }
}

run();

