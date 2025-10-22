'use client';

import React, { ReactNode } from 'react';
import AdminSidebar, { AdminTab } from '@/components/AdminSidebar';

interface AdminLayoutClientProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

const AdminLayoutClient: React.FC<AdminLayoutClientProps> = ({
  activeTab,
  onTabChange,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-light text-primary">
      <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex w-full flex-1 flex-col">
        <header className="flex flex-col gap-2 border-b border-blue-100 bg-white px-6 py-6 shadow-sm lg:px-10">
          <p className="text-xs uppercase tracking-wide text-blue-400">Storefront Dashboard</p>
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-semibold text-primary">{title ?? 'Toko Anda'}</h1>
            {subtitle ? <p className="text-sm text-blue-400">{subtitle}</p> : null}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayoutClient;

