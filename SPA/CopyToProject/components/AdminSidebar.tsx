'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon } from './icons/HomeIcon';
import { TagIcon } from './icons/TagIcon';
import { CogIcon } from './icons/CogIcon';
import { StorefrontIcon } from './icons/StorefrontIcon';

interface AdminSidebarProps {
    storeName: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ storeName }) => {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Overview', icon: <HomeIcon /> },
        { href: '/admin/products', label: 'Produk', icon: <TagIcon /> },
        { href: '/admin/settings', label: 'Pengaturan', icon: <CogIcon /> },
        { href: '/admin/preview', label: 'Preview', icon: <StorefrontIcon /> },
    ];
    
    return (
        <>
            {/* Sidebar untuk Desktop */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex md:flex-col">
                <div className="p-6 border-b">
                  <h1 className="text-2xl font-bold text-primary">{storeName}</h1>
                  <p className="text-sm text-gray-600">Admin Panel</p>
                </div>
                <nav className="p-4">
                    <ul>
                        {navItems.map(item => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <li key={item.href}>
                                    <Link href={item.href} className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-base ${
                                            isActive
                                                ? 'bg-secondary text-white font-bold'
                                                : 'text-gray-700 hover:bg-light'
                                        }`}>
                                        {item.icon}
                                        <span className="ml-3">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 flex justify-around">
                {navItems.map(item => {
                     const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                     return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
                                isActive
                                    ? 'text-secondary font-bold'
                                    : 'text-gray-500 hover:text-secondary'
                            }`}
                            aria-current={isActive}>
                            {item.icon}
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    );
};

export default AdminSidebar;
