// components/dashboard-layout-client.tsx
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';
import FeedbackModal from './feedback-modal';
import type { SessionUser, Page } from '../lib/types';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: SessionUser;
}

const DashboardLayoutClient: React.FC<DashboardLayoutClientProps> = ({ children, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const onNavigate = (page: Page) => {
        router.push(`/${page}`);
    };

    const currentPage = pathname.substring(1) as Page;

    return (
        <div className="bg-[#F5F5F5] min-h-screen text-gray-800 font-sans">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                currentPage={currentPage}
                onNavigate={onNavigate}
            />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <div className="fixed top-0 left-0 right-0 z-20 bg-[#F5F5F5]/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-8 lg:pl-72">
                    <Header 
                      onMenuClick={() => setIsSidebarOpen(true)} 
                      onFeedbackClick={() => setIsFeedbackModalOpen(true)}
                      user={user}
                    />
                </div>
            </div>

            <div className="lg:pl-64">
                <main className="px-8 pt-20">
                    {children}
                </main>
            </div>
            
            <FeedbackModal 
              isOpen={isFeedbackModalOpen} 
              onClose={() => setIsFeedbackModalOpen(false)} 
            />
        </div>
    );
};

export default DashboardLayoutClient;
