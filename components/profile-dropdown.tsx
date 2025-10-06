// components/profile-dropdown.tsx
'use client';

import React from 'react';
import { LogoutIcon } from '../lib/icons';
import { User } from '../lib/types';

interface ProfileDropdownProps {
  isOpen: boolean;
  user: User;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, user }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800 animate-fadeInTopRight origin-top-right z-30"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
    >
      <div className="p-4 border-b border-gray-100">
        <p className="font-bold text-[#0D47A1]">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="p-2">
        <button className="w-full text-left px-4 py-2 text-sm font-semibold text-white bg-[#0D47A1] hover:bg-[#1565C0] rounded-lg transition-colors">
          Upgrade Plan
        </button>
      </div>
      <div className="p-2">
        <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0D47A1] rounded-lg transition-colors" role="menuitem">
          <LogoutIcon className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
