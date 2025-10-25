"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import {
  AppData,
  User,
  Project,
  DashboardStatsData,
  CreditHistoryItem,
  Page,
} from '@/lib/types';
import { useRouter } from 'next/navigation';

type UserApiKeyState = {
  hasKey: boolean;
  masked: string | null;
  updatedAt: string | null;
};

type UserApiKeyPayload = {
  hasKey?: boolean;
  masked?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
} | null;

interface AppContextType {
    user: User | null;
    projects: Project[];
    dashboardStats: DashboardStatsData | null;
    creditHistory: CreditHistoryItem[];
    isSidebarOpen: boolean;
    userApiKeyInfo: UserApiKeyState;
    setInitialData: (data: AppData) => void;
    handleSaveProject: (newProject: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<Project>;
    handleCreditDeduction: (amount: number, generationId?: string | null) => Promise<void>;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
    onNavigate: (page: 'dashboard' | 'generate-image' | 'settings' | 'generate-caption' | 'generate-text' | 'gallery') => void;
    setUserApiKeyInfo: (info: UserApiKeyPayload) => void;
    refreshUserApiKeyInfo: () => Promise<void>;
}

const EMPTY_USER_API_KEY_INFO: UserApiKeyState = {
  hasKey: false,
  masked: null,
  updatedAt: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: AppData;
}) => {
  const [user, setUser] = useState<User | null>(initialData?.user ?? null);
  const [projects, setProjects] = useState<Project[]>(initialData?.projects ?? []);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsData | null>(
    initialData?.dashboardStats ?? null
  );
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>(initialData?.creditHistory ?? []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userApiKeyInfo, setUserApiKeyInfoState] = useState<UserApiKeyState>(EMPTY_USER_API_KEY_INFO);
  const router = useRouter();

  const normalizeUserApiKeyInfo = useCallback((info: UserApiKeyPayload): UserApiKeyState => {
    if (!info) {
      return EMPTY_USER_API_KEY_INFO;
    }
    return {
      hasKey: Boolean(info.hasKey),
      masked: info.masked ?? null,
      updatedAt: info.updatedAt ?? info.updated_at ?? null,
    };
  }, []);

  const refreshUserApiKeyInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/user/api-key', { cache: 'no-store' });
      if (!response.ok) {
        setUserApiKeyInfoState(EMPTY_USER_API_KEY_INFO);
        return;
      }
      const data = await response.json();
      setUserApiKeyInfoState(normalizeUserApiKeyInfo(data));
    } catch (error) {
      console.error('Failed to load saved API key:', error);
      setUserApiKeyInfoState(EMPTY_USER_API_KEY_INFO);
    }
  }, [normalizeUserApiKeyInfo]);

  useEffect(() => {
    void refreshUserApiKeyInfo();
  }, [refreshUserApiKeyInfo]);

  useEffect(() => {
    if (!initialData) {
      return;
    }
    setUser(initialData.user);
    setProjects(initialData.projects);
    setDashboardStats(initialData.dashboardStats);
    setCreditHistory(initialData.creditHistory);
  }, [initialData]);

  const setInitialData = useCallback((data: AppData) => {
    setUser(data.user);
    setProjects(data.projects);
    setDashboardStats(data.dashboardStats);
    setCreditHistory(data.creditHistory);
  }, []);

  const setUserApiKeyInfo = useCallback((info: UserApiKeyPayload) => {
    setUserApiKeyInfoState(normalizeUserApiKeyInfo(info));
  }, [normalizeUserApiKeyInfo]);

  const handleSaveProject = useCallback(
    async (newProjectData: Omit<Project, "id" | "user_id" | "created_at">) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProjectData),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          "Gagal menyimpan project.";
        throw new Error(message);
      }

      const savedProject = payload as Project;
      setProjects((prevProjects) => [savedProject, ...prevProjects]);
      return savedProject;
    },
    []
  );

    const handleCreditDeduction = async (amount: number, generationId: string | null = null) => {
        try {
            const response = await fetch('/api/credits/deduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, generationId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengurangi kredit.');
            }

            setUser(prevUser => {
                if (!prevUser) return null;
                return { ...prevUser, credits: data.newCredits };
            });

            setDashboardStats(prevStats => {
                if (!prevStats) return null;
                return { ...prevStats, totalCreditsUsed: prevStats.totalCreditsUsed + amount };
            });

            setCreditHistory(prevHistory => [
                data.newHistoryItem,
                ...prevHistory,
            ]);

        } catch (error) {
            console.error('Error deducting credits:', error);
            // Opsional: tampilkan notifikasi error ke pengguna
        }
    };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const onNavigate = (page: Page) => {
    const pathMap: Record<Page, string> = {
      dashboard: '/dashboard',
      'generate-image': '/generate-image',
      'generate-caption': '/generate-caption',
      'generate-text': '/generate-text',
      gallery: '/gallery',
      settings: '/settings',
    };
    router.push(pathMap[page]);
  };

  const value = {
    user,
    projects,
    dashboardStats,
    creditHistory,
    isSidebarOpen,
    userApiKeyInfo,
    setInitialData,
    handleSaveProject,
    handleCreditDeduction,
    setSidebarOpen: setIsSidebarOpen,
    toggleSidebar,
    onNavigate,
    setUserApiKeyInfo,
    refreshUserApiKeyInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
