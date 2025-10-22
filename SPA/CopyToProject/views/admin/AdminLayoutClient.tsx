'use client';

import React from 'react';
import { StorefrontSettings } from '@/types';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayoutClient = ({
    children,
    settings
}: {
    children: React.ReactNode,
    settings: StorefrontSettings,
}) => {
  return (
    <div className="flex h-screen bg-light font-sans">
        <AdminSidebar storeName={settings.name} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                {children}
            </main>
        </div>
    </div>
  );
};

export default AdminLayoutClient;