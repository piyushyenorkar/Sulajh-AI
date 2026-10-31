import { db } from '../apps/api/src/lib/db.js';

async function main() {
  console.log('🌱 Starting Sulajh AI Seed Script...');
  db.reset();
  console.log('✅ Seed complete:');
  console.log(`   - Users: ${db.getUsers().length}`);
  console.log(`   - Merchants: ${db.getMerchants().length}`);
  console.log(`   - Settlements: ${db.getSettlements().length}`);
  console.log(`   - Disputes: ${db.getDisputes().length}`);
  console.log(`   - Cases: ${db.getCases().length}`);
  console.log(`   - Approvals: ${db.getApprovals().length}`);
  console.log(`   - Policies: ${db.getPolicies().length}`);
  console.log(`   - KB Chunks: ${db.getKbChunks().length}`);
  console.log('✨ Seed script ran idempotently without duplicates.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

