// lib/data.ts
import { supabase } from './supabase-client';
import { User, DashboardStatsData, Project, CreditHistoryItem, AppData } from './types';

// CATATAN PENTING:
// 1. Ganti 'nama_tabel_anda' dengan nama tabel yang sebenarnya di Supabase.
// 2. Pastikan kebijakan RLS (Row Level Security) Anda di Supabase dikonfigurasi
//    untuk mengizinkan permintaan 'select' ini.
// 3. Diasumsikan Anda memiliki data pengguna yang terkait dengan sesi saat ini.
//    Untuk proyek nyata, Anda akan mendapatkan ID pengguna dari sesi Supabase Auth.
//    Untuk contoh ini, kita akan mengambil data pertama yang ditemukan.

async function fetchFromSupabase(tableName: string, errorMessage: string) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1).single();

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw new Error(errorMessage);
  }
  return data;
}

export async function getUser(): Promise<User> {
  // Dalam aplikasi nyata, Anda akan mendapatkan pengguna yang sedang login.
  // const { data: { user } } = await supabase.auth.getUser();
  // const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
  
  // Untuk tujuan demo, kita ambil pengguna pertama dari tabel 'users'.
  // GANTI 'users' dengan nama tabel pengguna Anda.
  return await fetchFromSupabase('users', 'Gagal mengambil data pengguna.');
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  // GANTI 'dashboard_stats' dengan nama tabel statistik Anda.
  return await fetchFromSupabase('dashboard_stats', 'Gagal mengambil statistik dasbor.');
}

export async function getProjects(): Promise<Project[]> {
  // GANTI 'projects' dengan nama tabel proyek Anda.
  const { data, error } = await supabase.from('projects').select('*');

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Gagal mengambil data proyek.');
  }
  return data || [];
}

export async function getCreditHistory(): Promise<CreditHistoryItem[]> {
  // GANTI 'credit_history' dengan nama tabel riwayat kredit Anda.
  const { data, error } = await supabase.from('credit_history').select('*').order('date', { ascending: false });

  if (error) {
    console.error('Error fetching credit history:', error);
    throw new Error('Gagal mengambil riwayat kredit.');
  }
  return data || [];
}
