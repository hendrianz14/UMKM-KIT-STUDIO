'use client';

import { useState } from 'react';
import type { Product, StorefrontSettings } from '@/lib/storefront/types';
import { StorefrontProvider } from './StorefrontProvider';
import StorefrontHeader from './StorefrontHeader';
import StorefrontQuoteDrawer from './StorefrontQuoteDrawer';

interface StorefrontShellProps {
  storefront: StorefrontSettings;
  products: Product[];
  children: React.ReactNode;
}

const StorefrontShell = ({
  storefront,
  products,
  children,
}: StorefrontShellProps) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <StorefrontProvider storefront={storefront} products={products}>
      <div className="bg-light min-h-screen text-gray-800">
        <StorefrontHeader onQuoteClick={() => setIsQuoteOpen(true)} />
        <main>{children}</main>
        <StorefrontQuoteDrawer
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
        />
      </div>
    </StorefrontProvider>
  );
};

export default StorefrontShell;
