// lib/types.ts

export type Plan = 'Gratis' | 'Basic' | 'Pro' | 'Enterprise';

export interface User {
  id: string; // Biasanya UUID dari Supabase
  name: string;
  email: string;
  plan: Plan;
  credits: number;
  expiryDate: string; // Sebaiknya dalam format ISO 8601 (misal: "2025-10-12T00:00:00Z")
}

export interface DashboardStatsData {
  weeklyWork: number;
  totalCreditsUsed: number;
}

export interface Project {
  id: number;
  title: string;
  type: string;
  imageUrl: string;
  user_id: string; // Foreign key ke tabel user
}

export interface CreditHistoryItem {
  id: number;
  type: string;
  date: string; // Sebaiknya dalam format ISO 8601
  amount: number;
  transactionId: number;
  user_id: string; // Foreign key ke tabel user
}

export interface AppData {
  user: User;
  dashboardStats: DashboardStatsData;
  projects: Project[];
  creditHistory: CreditHistoryItem[];
}
