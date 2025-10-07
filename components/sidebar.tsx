
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  GenerateIcon,
  GalleryIcon,
  EditorIcon,
  HistoryIcon,
  SettingsIcon,
  ChevronDownIcon,
  XIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from '../lib/constants';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  isDropdownOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, active = false, hasDropdown = false, onClick, isDropdownOpen }) => {
  const baseClasses = "flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors duration-200 text-left";
  const activeClasses = active ? "bg-[#1565C0] text-white" : "text-blue-200 hover:bg-[#1565C0] hover:text-white";
  const finalClasses = `${baseClasses} ${activeClasses}`;

  const content = (
    <>
      {icon}
      <span className="ml-3 flex-1">{label}</span>
      {hasDropdown && <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={finalClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={finalClasses}>
      {content}
    </button>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [isGenerateOpen, setIsGenerateOpen] = useState(pathname.startsWith('/generateimage'));

  useEffect(() => {
    if (pathname.startsWith('/generateimage')) {
      setIsGenerateOpen(true);
    }
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0D47A1] p-4 border-r border-[#1565C0]
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white px-4">UMKM KitStudio</h1>
        <button onClick={onClose} className="lg:hidden p-1 text-blue-200 hover:text-white" aria-label="Close menu">
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem 
          icon={<HomeIcon className="w-5 h-5" />} 
          label="Dashboard" 
          active={isActive('/')} 
          href="/"
          onClick={onClose}
        />
        
        <div>
          <NavItem 
            icon={<GenerateIcon className="w-5 h-5" />} 
            label="Generate" 
            hasDropdown 
            onClick={() => setIsGenerateOpen(!isGenerateOpen)}
            isDropdownOpen={isGenerateOpen}
          />
          <div className={`grid transition-all duration-300 ease-in-out ${isGenerateOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem 
                    icon={<ImageIcon className="w-5 h-5" />} 
                    label="Gambar AI" 
                    active={isActive('/generateimage')}
                    href="/generateimage"
                    onClick={onClose}
                  />
                  <NavItem icon={<TextIcon className="w-5 h-5" />} label="Caption AI" />
                  <NavItem icon={<VideoIcon className="w-5 h-5" />} label="Video AI" />
                </div>
            </div>
          </div>
        </div>
        
        <NavItem icon={<GalleryIcon className="w-5 h-5" />} label="Galeri" />
        <NavItem icon={<EditorIcon className="w-5 h-5" />} label="Editor" />
        <NavItem icon={<HistoryIcon className="w-5 h-5" />} label="History" />
        <NavItem 
          icon={<SettingsIcon className="w-5 h-5" />} 
          label="Settings" 
          active={isActive('/settings')}
          href="/settings"
          onClick={onClose}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
