import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Admin client — uses the service-role key.
 * Use for server-side operations that bypass RLS.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(getEnvOrThrow('SUPABASE_URL'), getEnvOrThrow('SUPABASE_SERVICE_KEY'), {
    auth: { persistSession: false },
  });
}

/**
 * User-scoped client — uses the anon key + optional user JWT.
 * RLS policies apply.
 */
export function createUserClient(accessToken?: string): SupabaseClient {
  const client = createClient(getEnvOrThrow('SUPABASE_URL'), getEnvOrThrow('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
  return client;
}
