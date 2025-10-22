'use client';

import React, { createContext, useState, ReactNode, useCallback, useContext } from 'react';
import { QuoteItem } from '@/types';

interface QuoteContextType {
  quoteItems: QuoteItem[];
  addToQuote: (item: QuoteItem) => void;
  updateQuoteItem: (productId: string, variantId: string | undefined, quantity: number, notes: string) => void;
  removeFromQuote: (productId: string, variantId?: string) => void;
  clearQuote: () => void;
}

export const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const useQuote = () => {
    const context = useContext(QuoteContext);
    if (context === undefined) {
      throw new Error('useQuote must be used within a QuoteProvider');
    }
    return context;
};

export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  const addToQuote = useCallback((item: QuoteItem) => {
    setQuoteItems(prev => {
        const existingItem = prev.find(i => i.productId === item.productId && i.variantId === item.variantId);
        if (existingItem) {
            return prev.map(i => i.productId === item.productId && i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i);
        }
        return [...prev, item];
    });
  }, []);

  const updateQuoteItem = useCallback((productId: string, variantId: string | undefined, quantity: number, notes: string) => {
    setQuoteItems(prev => prev.map(i => (i.productId === productId && i.variantId === variantId) ? {...i, quantity, notes } : i));
  }, []);
  
  const removeFromQuote = useCallback((productId: string, variantId?: string) => {
    setQuoteItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));
  }, []);

  const clearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

  return (
    <QuoteContext.Provider value={{
      quoteItems,
      addToQuote,
      updateQuoteItem,
      removeFromQuote,
      clearQuote,
    }}>
      {children}
    </QuoteContext.Provider>
  );
};