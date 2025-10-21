import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Note: These environment variables should be configured in your deployment environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);
