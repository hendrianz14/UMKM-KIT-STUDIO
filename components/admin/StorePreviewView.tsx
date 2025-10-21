'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import PublicView from '../PublicView';
import ProductDetailView from '../ProductDetailView';
import Header from '../HeaderStorefront';
import QuoteDrawer from '../QuoteDrawer';

const StorePreviewView: React.FC = () => {
  const { storefrontSettings } = useStore();
  const [previewingProductSlug, setPreviewingProductSlug] = useState<string | null>(null);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

  return (
    <div className="bg-gray-200/50 rounded-lg shadow-inner border border-gray-200 h-full flex flex-col">
      <div className="bg-white p-3 rounded-t-lg border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold text-primary">Pratinjau Toko</h2>
        <p className="text-sm text-gray-600">Ini adalah tampilan toko Anda yang akan dilihat oleh pelanggan. Interaksi seperti menambah ke keranjang akan berfungsi.</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-light">
        {/* We need to re-provide the public layout components for the preview */}
        <Header onQuoteClick={() => setIsQuoteDrawerOpen(true)} />
        {previewingProductSlug ? (
          <ProductDetailView
            storeSlug={storefrontSettings.slug}
            productSlug={previewingProductSlug}
            isPreviewMode={true}
            onBackToCatalog={() => setPreviewingProductSlug(null)}
          />
        ) : (
          <PublicView
            storeSlug={storefrontSettings.slug}
            isPreviewMode={true}
            onProductSelect={setPreviewingProductSlug}
          />
        )}
      </div>
       <QuoteDrawer isOpen={isQuoteDrawerOpen} onClose={() => setIsQuoteDrawerOpen(false)} />
    </div>
  );
};

export default StorePreviewView;
