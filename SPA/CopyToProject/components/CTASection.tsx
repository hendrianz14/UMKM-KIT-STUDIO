import React from 'react';
import { KitStudioLogo } from './icons/KitStudioLogo';

const CTASection: React.FC = () => {
  return (
    <footer className="bg-light border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center items-center">
        <a 
          href="https://aistudio.google.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <KitStudioLogo />
          <span className="text-sm">Halaman ini dibuat di UKM Kits</span>
        </a>
      </div>
    </footer>
  );
};

export default CTASection;