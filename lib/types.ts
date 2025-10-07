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
  imageUrl: string;
  caption: string;
  aspectRatio: string;
  promptDetails?: string;
  type: 'image' | 'caption' | 'video';
  promptFull?: string;
  // FIX: Add missing properties to align with usage in generateimage page.
  jobId?: string;
  userId?: string;
  status?: string;
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
  userApiKeyStatus?: {
    isSet: boolean;
  };
}
