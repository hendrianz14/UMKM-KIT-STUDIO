export type Plan = 'Gratis' | 'Basic' | 'Pro' | 'Enterprise';
export type Page = 'dashboard' | 'generate-image' | 'generate-caption' | 'settings';
export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

export interface User {
  name: string;
  email: string;
  plan: Plan;
  credits: number;
  expiryDate: string;
}

export interface DashboardStatsData {
  weeklyWork: number;
  totalCreditsUsed: number;
}

export interface Project {
  id: number;
  title: string;
  imageUrl: string;
  imageStoragePath?: string | null;
  caption: string;
  aspectRatio: string;
  promptDetails?: string;
  type: 'image' | 'caption' | 'video';
  promptFull?: string;
  created_at: string;
}

export interface CreditHistoryItem {
  id: number;
  type: string;
  date: string;
  amount: number;
  transactionId?: number; // Made optional as it might not come from DB
  created_at?: string;
}

export interface AppData {
  user: User;
  dashboardStats: DashboardStatsData;
  projects: Project[];
  creditHistory: CreditHistoryItem[];
}


// Types for Generate Image Component
export type StyleCategory = 'style' | 'lighting' | 'composition' | 'mood';

export type StyleOption = { 
  category: StyleCategory; 
  name: string; 
  options: string[];
};

export type SelectedStyles = {
    [key: string]: string | null;
};

export interface SavedStyle {
    id: number;
    name: string;
    styles: SelectedStyles;
}
