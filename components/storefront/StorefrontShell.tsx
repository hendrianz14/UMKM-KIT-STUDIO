'use client';

import { useEffect, useState } from 'react';
import type { Product, StorefrontSettings } from '@/lib/storefront/types';
import { StorefrontProvider } from './StorefrontProvider';
import StorefrontHeader from './StorefrontHeader';
import StorefrontQuoteDrawer from './StorefrontQuoteDrawer';
import { trackEvent } from '@/lib/analytics/client';

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

  useEffect(() => {
    if (storefront?.id) {
      trackEvent({ type: 'store_view', storeId: storefront.id });
    }
  }, [storefront?.id]);

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
