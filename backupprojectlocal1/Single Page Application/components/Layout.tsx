import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FeedbackModal from './FeedbackModal';
import { Page } from '../App';

interface User {
  name: string;
  email: string;
}

interface LayoutProps {
    children: React.ReactNode;
    user: User;
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentPage, onNavigate }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const handleNavigate = (page: Page) => {
      onNavigate(page);
      setIsSidebarOpen(false); // Close sidebar on navigation, especially for mobile
    }

    return (
        <div className="bg-[#F5F5F5] min-h-screen text-gray-800 font-sans">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                currentPage={currentPage}
                onNavigate={handleNavigate}
            />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            {/* Main content area with padding to avoid sidebar */}
            <div className="lg:pl-64">
                {/* Fixed Header */}
                <div className="fixed top-0 left-0 right-0 z-20 bg-[#F5F5F5]/80 backdrop-blur-md border-b border-gray-200 lg:left-64">
                    <div className="max-w-7xl mx-auto px-8">
                        <Header 
                          onMenuClick={() => setIsSidebarOpen(true)} 
                          onFeedbackClick={() => setIsFeedbackModalOpen(true)}
                          user={user}
                        />
                    </div>
                </div>

                {/* Main content with padding-top to avoid header */}
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

export default Layout;