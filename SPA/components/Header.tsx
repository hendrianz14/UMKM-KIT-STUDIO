import React from 'react';
import { useStore } from '../hooks/useStore';
import { CartIcon } from './icons/CartIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
// Fix: Added StorefrontSettings import to define component props.
import { StorefrontSettings } from '../types';

interface HeaderProps {
    onQuoteClick: () => void;
    // Fix: Added optional settings prop for Next.js compatibility.
    settings?: StorefrontSettings;
}

const Header: React.FC<HeaderProps> = ({ onQuoteClick, settings }) => {
  // Fix: Prioritize passed `settings` prop, fallback to context for CRA compatibility.
  const { storefrontSettings: contextStorefrontSettings, quoteItems } = useStore();
  const storefrontSettings = settings || contextStorefrontSettings;
  const quoteItemCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!storefrontSettings) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center"></nav>
      </header>
    );
  }

  const handleWhatsAppChat = () => {
    const message = `Halo, saya ingin bertanya tentang produk di *${storefrontSettings.name}*.`;
    const whatsappUrl = `https://wa.me/${storefrontSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href={`/shop/${storefrontSettings.slug}`} className="text-xl sm:text-2xl font-bold text-primary truncate pr-2">
          {storefrontSettings.name}
        </a>
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