'use client';

import React from 'react';
import { formatCurrency, truncate } from '@/lib/utils.client';
import type { StorefrontProduct } from '@/types/storefront.types';
import { EditorIcon, TrashIcon, CopyIcon } from '@/lib/constants';

interface ProductCardProps {
  product: StorefrontProduct;
  isActive?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isActive = false,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const image = product.images[0]?.url ?? 'https://dummyimage.com/600x400/f5f5f5/0d47a1&text=KitStudio';

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition ${
        isActive ? 'border-primary ring-2 ring-primary/20' : 'border-blue-100'
      }`}
    >
      <div className="relative aspect-[4/3] bg-blue-50">
        <img src={image} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow">
          {(product.status ?? 'Draft').toString()}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
          <p className="mt-1 text-sm text-blue-400">{truncate(product.shortDescription ?? '', 88)}</p>
        </div>
        <p className="text-lg font-semibold text-primary">{formatCurrency(product.price ?? 0)}</p>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            <EditorIcon className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            <CopyIcon className="h-4 w-4" />
            Duplikat
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-100"
          >
            <TrashIcon className="h-4 w-4" />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
