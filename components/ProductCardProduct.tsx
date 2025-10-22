'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, truncate } from '@/lib/utils.client';
import type { StorefrontProduct } from '@/types/storefront.types';
import { useStorefrontContext } from '@/contexts/StorefrontContext';

interface ProductCardProductProps {
  product: StorefrontProduct;
  onQuoteClick: (product: StorefrontProduct) => void;
}

const ProductCardProduct: React.FC<ProductCardProductProps> = ({ product, onQuoteClick }) => {
  const { storefront } = useStorefrontContext();
  const coverImage =
    product.images[0]?.url ?? 'https://dummyimage.com/800x600/f5f5f5/0d47a1&text=Produk+KitStudio';
  const storeSlug = storefront?.slug ?? 'store';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={coverImage} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">
          {product.type === 'custom' ? 'Custom' : product.type === 'variable' ? 'Variasi' : 'Produk'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-6">
        <div>
          <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
          <p className="mt-1 text-sm text-blue-500">{truncate(product.shortDescription ?? '', 120)}</p>
        </div>
        <p className="text-xl font-bold text-primary">
          {formatCurrency(product.price ?? 0)}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onQuoteClick(product)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            Minta Penawaran
          </button>
          <Link
            href={`/shop/${storeSlug}/product/${product.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCardProduct;
