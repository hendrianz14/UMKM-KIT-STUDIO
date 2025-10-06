// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Periksa apakah variabel lingkungan telah diatur
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in your .env.local file');
}

// Buat dan ekspor klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
