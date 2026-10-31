import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

async function main() {
  console.log('Testing Supabase with @supabase/supabase-js...');
  
  // Test with service role key
  const adminClient = createClient(url, serviceKey);
  const { data: users, error: usersErr } = await adminClient.auth.admin.listUsers();
  if (usersErr) {
    console.error('Admin auth test error:', usersErr.message);
  } else {
    console.log('Admin auth connection successful! Total users in Supabase Auth:', users.users?.length);
  }

  // Test table check
  const { data: tableData, error: tableErr } = await adminClient.from('merchants').select('*').limit(1);
  if (tableErr) {
    console.log('Table merchants query response:', tableErr.message, tableErr.code);
  } else {
    console.log('Table merchants exists, count:', tableData?.length);
  }
}

main();

