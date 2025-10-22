'use client';

import React from 'react';
import { BarChartIcon, BoxIcon, GalleryIcon, SettingsIcon, StoreIcon } from '@/lib/constants';

export type AdminTab = 'overview' | 'products' | 'preview' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAVIGATION: Array<{
  key: AdminTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'overview',
    label: 'Ringkasan',
    description: 'Lihat performa storefront Anda.',
    icon: <BarChartIcon className="w-5 h-5" />,
  },
  {
    key: 'products',
    label: 'Produk',
    description: 'Kelola katalog produk.',
    icon: <BoxIcon className="w-5 h-5" />,
  },
  {
    key: 'preview',
    label: 'Pratinjau',
    description: 'Tinjau tampilan publik toko.',
    icon: <GalleryIcon className="w-5 h-5" />,
  },
  {
    key: 'settings',
    label: 'Pengaturan',
    description: 'Perbarui detail dan identitas brand.',
    icon: <SettingsIcon className="w-5 h-5" />,
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-blue-100 bg-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
          <StoreIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-400">Storefront</p>
          <h2 className="text-lg font-semibold text-primary">KitStudio</h2>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 pb-6">
        {NAVIGATION.map((item) => {
          const isActive = item.key === activeTab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-transparent bg-blue-50/40 text-primary hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <p className={`mt-2 text-xs ${isActive ? 'text-white/80' : 'text-blue-400'}`}>
                {item.description}
              </p>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
