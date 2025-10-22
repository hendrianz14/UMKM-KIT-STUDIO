'use client';

import { useState } from 'react';
import { useStorefront } from '../StorefrontProvider';
import StorefrontCatalog from '../StorefrontCatalog';
import StorefrontProductDetail from '../StorefrontProductDetail';
import StorefrontHeader from '../StorefrontHeader';
import StorefrontQuoteDrawer from '../StorefrontQuoteDrawer';

const StorePreviewView = () => {
  const { storefront, products } = useStorefront();
  const [previewProductSlug, setPreviewProductSlug] = useState<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const previewProduct = previewProductSlug
    ? products.find((product) => product.slug === previewProductSlug)
    : null;

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-gray-200/50 shadow-inner">
      <div className="sticky top-0 z-10 rounded-t-lg border-b bg-white p-3">
        <h2 className="text-xl font-bold text-primary">Pratinjau Toko</h2>
        <p className="text-sm text-gray-600">
          Ini adalah tampilan toko Anda yang akan dilihat oleh pelanggan. Interaksi
          seperti menambah ke ringkasan akan berfungsi.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-light">
        <StorefrontHeader onQuoteClick={() => setIsDrawerOpen(true)} />
        {previewProduct && (
          <StorefrontProductDetail
            storeSlug={storefront.slug}
            product={previewProduct}
            isPreviewMode
            onBackToCatalog={() => setPreviewProductSlug(null)}
          />
        )}
        {!previewProduct && (
          <StorefrontCatalog
            storeSlug={storefront.slug}
            isPreviewMode
            onProductSelect={setPreviewProductSlug}
          />
        )}
      </div>

      <StorefrontQuoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default StorePreviewView;
