import React from 'react';
import { useStore } from '../hooks/useStore';
import { CartIcon } from './icons/CartIcon';

interface HeaderProps {
    onQuoteClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onQuoteClick }) => {
  const { storefrontSettings, quoteItems } = useStore();
  const quoteItemCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href={`/shop/${storefrontSettings.slug}`} className="text-2xl font-bold text-primary">
          {storefrontSettings.name}
        </a>
        <button onClick={onQuoteClick} className="relative p-2">
          <CartIcon />
          {quoteItemCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {quoteItemCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};

export default Header;