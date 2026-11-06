import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabaseClient: SupabaseClient | null = null;

if (env.SUPABASE_URL && env.SUPABASE_KEY) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  } catch (err) {
    console.warn('Gagal menginisialisasi Supabase client:', err);
    supabaseClient = null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

