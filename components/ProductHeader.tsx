'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils.client';
import type { StorefrontProduct } from '@/types/storefront.types';

interface ProductHeaderProps {
  product: StorefrontProduct;
  onQuoteClick: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product, onQuoteClick }) => {
  const headline = product.category ?? 'Produk KitStudio';

  return (
    <div className="rounded-3xl bg-gradient-to-r from-primary via-primary to-secondary px-6 py-10 text-white shadow-xl md:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/70">{headline}</p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-white/80">{product.longDescription ?? product.shortDescription}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="text-sm uppercase tracking-wide text-white/70">Harga mulai</span>
          <span className="text-3xl font-bold">{formatCurrency(product.price ?? 0)}</span>
          <button
            type="button"
            onClick={onQuoteClick}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:bg-accent hover:text-primary"
          >
            Minta Penawaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
