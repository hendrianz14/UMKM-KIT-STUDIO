
'use client';

import React, { useState } from 'react';
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
  StoreIcon,
  BoxIcon,
  HelpCircleIcon,
  BarChartIcon,
  MessageCircleIcon,
  CalendarIcon,
  PieChartIcon,
  Share2Icon,
  CreditIcon,
  SparklesIcon,
  MessageSquareIcon,
  PlayIcon,
  SlashIcon,
  KeyIcon,
} from '@/lib/constants';
import { Page } from '@/lib/types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  isDropdownOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, hasDropdown = false, onClick, isDropdownOpen }) => {
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

  if (onClick) {
    return (
      <button onClick={onClick} className={finalClasses}>
        {content}
      </button>
    );
  }

  return (
    <a href="#" className={finalClasses}>
      {content}
    </a>
  );
};


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
    const isContentPage = [
    'generate-image', 
    'textgenerator', 
    'generate-text', 
    'generate-caption', 
    'generate-catalog', 
    'generate-whatsapp', 
    'generate-email'
  ].includes(currentPage);

  const [isContentStudioOpen, setIsContentStudioOpen] = useState(isContentPage);
  const [isStorefrontOpen, setIsStorefrontOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(currentPage === 'settings' || currentPage === 'billing');
  
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
        <h1 className="text-xl font-bold text-white px-4">UKM Kits</h1>
        <button onClick={onClose} className="lg:hidden p-1 text-blue-200 hover:text-white" aria-label="Close menu">
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        <NavItem 
          icon={<HomeIcon className="w-5 h-5" />} 
          label="Dashboard" 
          active={currentPage === 'dashboard'} 
          onClick={() => onNavigate('dashboard')}
        />
        
        {/* Content Studio Dropdown Section */}
        <div>
          <NavItem 
            icon={<GenerateIcon className="w-5 h-5" />} 
            label="Content Studio" 
            hasDropdown 
            onClick={() => setIsContentStudioOpen(!isContentStudioOpen)}
            isDropdownOpen={isContentStudioOpen}
          />
          <div className={`grid transition-all duration-300 ease-in-out ${isContentStudioOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem 
                    icon={<ImageIcon className="w-5 h-5" />} 
                    label="Gambar AI" 
                    active={currentPage === 'generate-image'}
                    onClick={() => onNavigate('generate-image')}
                  />
                  <NavItem 
                    icon={<TextIcon className="w-5 h-5" />} 
                    label="Generator Teks"
                    active={['generate-text', 'textgenerator', 'generate-caption', 'generate-catalog', 'generate-whatsapp', 'generate-email'].includes(currentPage)}
                    onClick={() => onNavigate('generate-text')}
                  />
                  <NavItem 
                    icon={<GalleryIcon className="w-5 h-5" />} 
                    label="Galeri" 
                    active={currentPage === 'gallery'}
                    onClick={() => onNavigate('gallery')} 
                  />
                  <NavItem icon={<EditorIcon className="w-5 h-5" />} label="Editor" />
                  <NavItem 
                    icon={<HistoryIcon className="w-5 h-5" />} 
                    label="History" 
                    active={currentPage === 'credits-history'}
                    onClick={() => onNavigate('credits-history')} 
                  />
                                                      <NavItem 
                    icon={<KeyIcon className="w-5 h-5" />} 
                    label="Kunci API Pribadi" 
                    active={currentPage === 'settings'}
                    onClick={() => onNavigate('settings')}
                  />
                </div>
            </div>
          </div>
        </div>

        {/* Storefront & Catalog Dropdown Section */}
        <div>
          <NavItem 
            icon={<StoreIcon className="w-5 h-5" />} 
            label="Storefront & Catalog" 
            hasDropdown 
            onClick={() => setIsStorefrontOpen(!isStorefrontOpen)}
            isDropdownOpen={isStorefrontOpen}
          />
          <div className={`grid transition-all duration-300 ease-in-out ${isStorefrontOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem
                    icon={<BoxIcon className="w-5 h-5" />}
                    label="Products"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/storefront';
                      }
                    }}
                  />
                  <NavItem icon={<HelpCircleIcon className="w-5 h-5" />} label="FAQ" />
                  <NavItem icon={<BarChartIcon className="w-5 h-5" />} label="Overview" />
                </div>
            </div>
          </div>
        </div>

        {/* Chat Dropdown Section */}
        <div>
          <NavItem 
            icon={<MessageCircleIcon className="w-5 h-5" />} 
            label="Chat" 
            hasDropdown 
            onClick={() => setIsChatOpen(!isChatOpen)}
            isDropdownOpen={isChatOpen}
          />
          <div className={`grid transition-all duration-300 ease-in-out ${isChatOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem icon={<SparklesIcon className="w-5 h-5" />} label="Auto Reply" />
                  <NavItem icon={<MessageSquareIcon className="w-5 h-5" />} label="Replies" />
                  <NavItem icon={<PlayIcon className="w-5 h-5" />} label="Simulator" />
                </div>
            </div>
          </div>
        </div>

        
        
        {/* Booking-Lite Dropdown Section */}
        <div>
          <NavItem 
            icon={<CalendarIcon className="w-5 h-5" />} 
            label="Booking-Lite" 
            hasDropdown 
            onClick={() => setIsBookingOpen(!isBookingOpen)}
            isDropdownOpen={isBookingOpen}
          />
          <div className={`grid transition-all duration-300 ease-in-out ${isBookingOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem icon={<CalendarIcon className="w-5 h-5" />} label="Reservations" />
                  <NavItem icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
                  <NavItem icon={<SlashIcon className="w-5 h-5" />} label="Blackouts" />
                </div>
            </div>
          </div>
        </div>

        
        
        <NavItem icon={<PieChartIcon className="w-5 h-5" />} label="Analytics" />
        
        {/* Settings Dropdown Section */}
        <div>
          <NavItem 
            icon={<SettingsIcon className="w-5 h-5" />} 
            label="Settings" 
            hasDropdown
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            isDropdownOpen={isSettingsOpen}
            active={currentPage === 'settings' || currentPage === 'billing'}
          />
           <div className={`grid transition-all duration-300 ease-in-out ${isSettingsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pl-6 space-y-1">
                  <NavItem icon={<Share2Icon className="w-5 h-5" />} label="Channels" />
                  <NavItem icon={<CreditIcon className="w-5 h-5" />} label="Billing" active={currentPage === 'billing'} onClick={() => onNavigate('billing')} />
                </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
