import React from 'react';
import OnboardingGate from '@/components/onboarding/OnboardingGate';
import { AppContextProvider } from '@/contexts/AppContext';
import { getDashboardData } from '@/lib/data';
import DashboardLayoutClient from '@/components/dashboard-layout-client';

export default async function AppSegmentLayout({ children }: { children: React.ReactNode }) {
  const initialData = await getDashboardData();
  return (
    <AppContextProvider initialData={initialData ?? undefined}>
      {initialData?.user ? (
        <DashboardLayoutClient user={initialData.user}>
          {children}
        </DashboardLayoutClient>
      ) : (
        <>{children}</>
      )}
      <OnboardingGate />
    </AppContextProvider>
  );
}
