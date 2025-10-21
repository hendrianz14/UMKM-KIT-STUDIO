import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Anon Key dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pastikan environment variables sudah diisi
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env.local");
}

// Inisialisasi dan ekspor klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);