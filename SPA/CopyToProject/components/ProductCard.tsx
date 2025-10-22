import React from 'react';
import { Product, ProductStatus } from '@/types';
import { getProductPriceRange } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const coverImage = product.images.find(img => img.id === product.coverImageId) || product.images[0];
  const { displayPrice, displayStrikethroughPrice } = getProductPriceRange(product);
  const isUnavailable = product.status === ProductStatus.UNAVAILABLE;
  const isPreOrder = product.status === ProductStatus.PRE_ORDER;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 flex flex-col group ${isUnavailable ? 'cursor-default' : 'hover:-translate-y-1 cursor-pointer'}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage.url} 
            alt={coverImage.altText || product.name} 
            className={`w-full h-full object-cover transition-transform duration-300 ${isUnavailable ? '' : 'group-hover:scale-105'}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        {isUnavailable && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="px-4 py-2 text-sm font-bold text-white uppercase bg-gray-800/80 rounded-full shadow-lg">
                    Tidak Tersedia
                </span>
            </div>
        )}
        {(product.badges.length > 0 || isPreOrder) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
            {isPreOrder && (
              <span className="px-2 py-1 text-xs font-bold text-white uppercase bg-blue-600 rounded-full shadow">
                Pre-Order
              </span>
            )}
            {product.badges.map(badge => (
              <span key={badge} className="px-2 py-1 text-xs font-bold text-gray-800 uppercase bg-accent rounded-full shadow">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className={`text-base font-bold text-gray-800 transition-colors flex-grow ${isUnavailable ? '' : 'group-hover:text-primary'}`}>{product.name}</h3>
        <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-lg font-extrabold text-gray-900">{displayPrice}</p>
            {displayStrikethroughPrice && <p className="text-sm text-gray-500 line-through">{displayStrikethroughPrice}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;