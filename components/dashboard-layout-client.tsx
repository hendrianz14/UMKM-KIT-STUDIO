// components/dashboard-layout-client.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import FeedbackModal from './feedback-modal';
import { User } from '../lib/types';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: User;
}

const DashboardLayoutClient: React.FC<DashboardLayoutClientProps> = ({ children, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    return (
        <div className="bg-[#F5F5F5] min-h-screen text-gray-800 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <div className="lg:pl-64">
                <div className="fixed top-0 left-0 right-0 z-20 bg-[#F5F5F5]/80 backdrop-blur-md border-b border-gray-200 lg:left-64">
                    <div className="max-w-7xl mx-auto px-8">
                        <Header 
                          onMenuClick={() => setIsSidebarOpen(true)} 
                          onFeedbackClick={() => setIsFeedbackModalOpen(true)}
                          user={user}
                        />
                    </div>
                </div>

                <main className="pt-20">
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
