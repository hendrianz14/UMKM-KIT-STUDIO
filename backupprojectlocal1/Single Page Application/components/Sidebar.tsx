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
  VideoIcon,
} from '../constants';
import { Page } from '../App';

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
  const [isGenerateOpen, setIsGenerateOpen] = useState(currentPage === 'generate-image');
  
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
      <nav className="flex-1 space-y-2">
        <NavItem 
          icon={<HomeIcon className="w-5 h-5" />} 
          label="Dashboard" 
          active={currentPage === 'dashboard'} 
          onClick={() => onNavigate('dashboard')}
        />
        
        {/* Generate Dropdown Section */}
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
                    active={currentPage === 'generate-image'}
                    onClick={() => onNavigate('generate-image')}
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
          active={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;