'use client';

import SafeImage from './SafeImage';
import type { Product } from '@/lib/storefront/types';
import { ProductStatus } from '@/lib/storefront/types';
import { getProductPriceRange } from '@/lib/storefront/utils';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const coverImage =
    product.images.find((image) => image.id === product.coverImageId) ??
    product.images[0];
  const { displayPrice } = getProductPriceRange(product);
  const isUnavailable = product.status === ProductStatus.UNAVAILABLE;
  const isPreOrder = product.status === ProductStatus.PRE_ORDER;

  const handleClick = () => {
    if (!onSelect || isUnavailable) return;
    onSelect();
  };

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition ${isUnavailable || !onSelect ? '' : 'hover:-translate-y-1'}`}
      onClick={handleClick}
      role={onSelect && !isUnavailable ? 'button' : undefined}
      tabIndex={onSelect && !isUnavailable ? 0 : -1}
      onKeyDown={(event) => {
        if (
          onSelect &&
          !isUnavailable &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {coverImage ? (
          <SafeImage
            src={coverImage.url}
            alt={coverImage.altText || product.name}
            fill
            className={`object-cover transition duration-300 ${isUnavailable ? '' : 'group-hover:scale-105'}`}
            sizes="(max-width: 1024px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
            Tidak ada foto
          </div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-gray-800/80 px-4 py-2 text-xs font-bold uppercase text-white shadow-lg">
              Tidak Tersedia
            </span>
          </div>
        )}
        {(product.badges.length > 0 || isPreOrder) && (
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
            {isPreOrder && (
              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-bold uppercase text-white shadow">
                Pre-Order
              </span>
            )}
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-accent px-2 py-1 text-xs font-bold uppercase text-gray-800 shadow"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3
          className={`flex-1 text-base font-bold text-gray-800 transition ${isUnavailable ? '' : 'group-hover:text-primary'}`}
        >
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-extrabold text-gray-900">
          {displayPrice}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
