export type Plan = 'Gratis' | 'Basic' | 'Pro' | 'Enterprise';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface User extends SessionUser {
  plan: Plan;
  credits: number;
  expiryDate: string; // ISO string
}

export interface DashboardStatsData {
  weeklyWork: number;
  totalCreditsUsed: number;
}

export interface Project {
  id: number;
  title: string;
  type: string;       // "Gambar AI" | "Caption AI" | "Video AI"
  imageUrl: string | null;
  user_id: string;
}

export interface CreditHistoryItem {
  id: number;
  type: string;       // "seed" | "Top Up" | "Refund" | "Credit Usage"
  date: string;       // ISO
  amount: number;
  transactionId: number;
  user_id: string;
}

export interface AppData {
  user: User;
  dashboardStats: DashboardStatsData;
  projects: Project[];
  creditHistory: CreditHistoryItem[];
}
