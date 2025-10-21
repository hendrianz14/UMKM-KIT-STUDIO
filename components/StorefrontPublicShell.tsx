'use client';

import React, { useState } from 'react';
import HeaderStorefront from '@/components/HeaderStorefront';
import QuoteDrawer from '@/components/QuoteDrawer';
import PublicView from '@/components/PublicView';
import type { Product, StorefrontSettings } from '@/types/storefront.types';

interface StorefrontPublicShellProps {
  storeSlug: string;
  settings: StorefrontSettings;
  products: Product[];
}

const StorefrontPublicShell: React.FC<StorefrontPublicShellProps> = ({
  storeSlug,
  settings,
  products,
}) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-light text-gray-800 flex flex-col">
      <HeaderStorefront onQuoteClick={() => setIsQuoteOpen(true)} settings={settings} />
      <main className="flex-grow">
        <PublicView
          storeSlug={storeSlug}
          storefrontSettings={settings}
          initialProducts={products}
        />
      </main>
      <QuoteDrawer
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        settings={settings}
        products={products}
      />
    </div>
  );
};

export default StorefrontPublicShell;
