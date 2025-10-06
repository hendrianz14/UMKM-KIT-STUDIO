import React from 'react';
import DashboardClient from '@/components/dashboard-client';
import { getDashboardStats, getProjects, getCreditHistory, getUser } from '@/lib/data';

export default async function DashboardPage() {
  // Ambil semua data yang diperlukan untuk halaman ini secara paralel di server.
  const [dashboardStats, projects, creditHistory, user] = await Promise.all([
    getDashboardStats(),
    getProjects(),
    getCreditHistory(),
    getUser()
  ]);

  const appData = {
    dashboardStats,
    projects,
    creditHistory,
    user
  };

  return <DashboardClient initialData={appData} />;
}
