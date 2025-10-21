import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon } from '../constants';
import ProfileDropdown from './ProfileDropdown';

interface User {
  name: string;
  email: string;
}

interface HeaderProps {
  onMenuClick: () => void;
  onFeedbackClick: () => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onFeedbackClick, user }) => {
  const [selectedLang, setSelectedLang] = useState<'ID' | 'EN'>('ID');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const baseButtonClass = "px-3 py-1 rounded-full transition-colors duration-200";
  const activeButtonClass = "bg-[#0D47A1] text-white";
  const inactiveButtonClass = "text-[#1565C0] hover:text-[#0D47A1] hover:bg-blue-100";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between space-x-4 lg:justify-end h-20">
      <button onClick={onMenuClick} className="p-1 text-[#1565C0] hover:text-[#0D47A1] lg:hidden" aria-label="Open menu">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-sm bg-white p-1 rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={() => setSelectedLang('ID')}
            className={`${baseButtonClass} ${selectedLang === 'ID' ? activeButtonClass : inactiveButtonClass}`}
          >
            ID
          </button>
          <button
            onClick={() => setSelectedLang('EN')}
            className={`${baseButtonClass} ${selectedLang === 'EN' ? activeButtonClass : inactiveButtonClass}`}
          >
            EN
          </button>
        </div>
        <button 
          onClick={onFeedbackClick}
          className="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-[#1565C0] rounded-full border border-gray-300 shadow-sm"
        >
          Feedback
        </button>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1565C0]">
            {user.name.charAt(0).toUpperCase()}
          </button>
          <ProfileDropdown isOpen={isProfileOpen} user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;