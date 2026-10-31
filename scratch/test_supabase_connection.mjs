import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Testing connection to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data, error } = await supabase.from('users').select('id, name, role, email');
    if (error) {
      console.error('Supabase Query Error:', error);
    } else {
      console.log('Successfully queried users from Supabase!');
      console.log('Users count:', data.length);
      console.log('Users sample:', data.slice(0, 3));
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();

