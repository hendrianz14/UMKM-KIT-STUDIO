import React from 'react';
// FIX: Changed from aliased path to relative path to fix module resolution error.
import Sidebar from '@/components/sidebar';
// FIX: Changed from aliased path to relative path to fix module resolution error.
import Header from '@/components/header';
import { AppContextProvider } from '@/contexts/AppContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppContextProvider>
        <div className="bg-[#F5F5F5] min-h-screen text-gray-800 font-sans">
            <Sidebar />

            <div className="lg:pl-64">
                <div className="fixed top-0 left-0 right-0 z-20 bg-[#F5F5F5]/80 backdrop-blur-md border-b border-gray-200 lg:left-64">
                    <div className="max-w-7xl mx-auto px-8">
                        <Header />
                    </div>
                </div>

                <main className="pt-20">
                    {children}
                </main>
            </div>
        </div>
    </AppContextProvider>
  );
}
export { default, dynamic, revalidate } from "../dashboard/layout";
