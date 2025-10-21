'use client';

import React, { useState } from 'react';
import HeaderStorefront from '@/components/HeaderStorefront';
import QuoteDrawer from '@/components/QuoteDrawer';
import ProductDetailView from '@/components/ProductDetailView';
import type { Product, StorefrontSettings } from '@/types/storefront.types';

interface StorefrontProductShellProps {
  storeSlug: string;
  productSlug: string;
  settings: StorefrontSettings;
  products: Product[];
  product: Product;
}

const StorefrontProductShell: React.FC<StorefrontProductShellProps> = ({
  storeSlug,
  productSlug,
  settings,
  products,
  product,
}) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-light text-gray-800 flex flex-col">
      <HeaderStorefront
        onQuoteClick={() => setIsQuoteOpen(true)}
        settings={settings}
      />
      <main className="flex-grow">
        <ProductDetailView
          storeSlug={storeSlug}
          productSlug={productSlug}
          product={product}
          storefrontSettings={settings}
          allProducts={products}
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

export default StorefrontProductShell;
