
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppData, Project } from '../lib/types';

interface AppProviderProps {
  children: ReactNode;
  initialData?: AppData | null;
}

interface AppContextType {
  appData: AppData | null;
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>;
  projectToShare: Project | null;
  setProjectToShare: React.Dispatch<React.SetStateAction<Project | null>>;
  handleSaveProject: (newProject: Project) => void;
  handleCreditDeduction: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, initialData = null }: AppProviderProps) => {
  const [appData, setAppData] = useState<AppData | null>(initialData);
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);

  useEffect(() => {
    if (initialData !== undefined) {
      setAppData(initialData ?? null);
    }
  }, [initialData]);

  const handleSaveProject = (newProject: Project) => {
    setAppData(prevData => {
        if (!prevData) return null;
        return {
            ...prevData,
            projects: [newProject, ...prevData.projects],
        };
    });
  };

  const handleCreditDeduction = (amount: number) => {
    setAppData(prevData => {
      if (!prevData) return null;
      
      const newCredits = Math.max(0, prevData.user.credits - amount);
      const newTotalCreditsUsed = prevData.dashboardStats.totalCreditsUsed + amount;

      console.log(`[CREDIT] Deducting ${amount}. Old: ${prevData.user.credits}, New: ${newCredits}`);

      return {
        ...prevData,
        user: {
          ...prevData.user,
          credits: newCredits,
        },
        dashboardStats: {
            ...prevData.dashboardStats,
            totalCreditsUsed: newTotalCreditsUsed,
        },
        creditHistory: [
            {
                id: Date.now(),
                user_id: prevData.user.id,
                type: 'Credit Usage',
                date: new Date().toLocaleString(),
                amount: -amount,
                transactionId: Math.floor(Math.random() * 1000000),
            },
            ...prevData.creditHistory,
        ]
      };
    });
  };

  return (
    <AppContext.Provider value={{ 
      appData, 
      setAppData, 
      projectToShare, 
      setProjectToShare,
      handleSaveProject,
      handleCreditDeduction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
