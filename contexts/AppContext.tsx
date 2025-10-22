'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
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
  refreshAppData: () => Promise<void>;
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
    setAppData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        projects: [newProject, ...prevData.projects],
      };
    });
  };

  const refreshAppData = useCallback(async () => {
    try {
      const response = await fetch('/api/bootstrap', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to refresh app data: ${response.status}`);
      }
      const data = (await response.json()) as AppData;
      setAppData(data);
    } catch (error) {
      console.error('Failed to refresh app data:', error);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        appData,
        setAppData,
        projectToShare,
        setProjectToShare,
        handleSaveProject,
        refreshAppData,
      }}
    >
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