export type Plan = 'Gratis' | 'Basic' | 'Pro' | 'Enterprise';

export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

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

export type SelectedStyles = Record<string, string | null>;

export interface StyleOption {
  category: string;
  name: string;
  options: string[];
}

export interface SavedStyle {
  id: number;
  name: string;
  styles: SelectedStyles;
}

export interface Project {
  id: number;
  title: string;
  type: string;       // "Gambar AI" | "Caption AI" | "Video AI"
  imageUrl: string | null;
  imageStoragePath?: string | null;
  caption?: string | null;
  aspectRatio?: string | null;
  promptDetails?: string | null;
  promptFull?: string | null;
  user_id: string;
  created_at?: string | null;
}

export interface CreditHistoryItem {
  id: number;
  type: string;       // "seed" | "Top Up" | "Refund" | "Credit Usage"
  date: string;       // ISO
  amount: number;
  transactionId?: number;
  user_id: string;
}

export interface AppData {
  user: User;
  dashboardStats: DashboardStatsData;
  projects: Project[];
  creditHistory: CreditHistoryItem[];
}


export type Preset = {
    id: string;
    name: string;
    styles: SelectedStyles;
    category: string;
};

export type Page = "dashboard" | "generate-image" | "generate-caption" | "settings";
