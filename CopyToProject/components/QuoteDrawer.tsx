'use client';

import React, { useMemo } from 'react';
import { useQuote } from '@/context/QuoteContext';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatCurrency } from '@/lib/utils';
import { PriceType, StorefrontSettings, Product } from '@/types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StorefrontSettings;
  products: Product[]; // Perlu semua produk untuk lookup
}

const QuoteDrawer: React.FC<QuoteDrawerProps> = ({ isOpen, onClose, settings, products }) => {
  const { quoteItems, removeFromQuote, clearQuote } = useQuote();

  const totalPrice = useMemo(() => {
    return quoteItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;

      let price = 0;
      if (product.priceType === PriceType.SINGLE) {
        price = product.price ?? 0;
      } else {
        const variant = product.variants.combinations.find(v => v.id === item.variantId);
        if (variant && !variant.askOnWA) {
          price = variant.price;
        }
      }
      return total + (price * item.quantity);
    }, 0);
  }, [quoteItems, products]);

  const handleSendQuote = () => {
    // ... Logika handleSendQuote tetap sama ...
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=...`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-[50] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-[60] transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* ... Sisa JSX dari QuoteDrawer.tsx lama ... */}
      </div>
    </>
  );
};

export default QuoteDrawer;