'use client';

import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { CartIcon } from './icons/CartIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { StorefrontSettings } from '@/types';
import Link from 'next/link';

interface HeaderProps {
    settings: StorefrontSettings;
    onQuoteClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ settings, onQuoteClick }) => {
  const { quoteItems } = useQuote();
  const quoteItemCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsAppChat = () => {
    const message = `Halo, saya ingin bertanya tentang produk di *${settings.name}*.`;
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={`/products`} className="text-xl sm:text-2xl font-bold text-primary truncate pr-2">
          {settings.name}
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
                onClick={handleWhatsAppChat} 
                className="hidden sm:flex items-center space-x-2 border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <WhatsAppIcon />
                <span>Chat WhatsApp</span>
            </button>
            <button onClick={onQuoteClick} className="relative p-2">
            <CartIcon />
            {quoteItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {quoteItemCount}
                </span>
            )}
            </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;