'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product, ProductStatus, StorefrontSettings } from '@/types';
import CTASection from '@/components/CTASection';
import { getSortPrice } from '@/lib/utils';
import Link from 'next/link';

interface PublicViewProps {
  storefrontSettings: StorefrontSettings;
  initialProducts: Product[];
  // Fix: Added storeSlug to props to build correct URLs.
  storeSlug: string;
}

const sortOptions = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-terendah', label: 'Harga Terendah' },
    { value: 'harga-tertinggi', label: 'Harga Tertinggi' },
];

const PublicView: React.FC<PublicViewProps> = ({ storefrontSettings, initialProducts, storeSlug }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSort, setActiveSort] = useState('terbaru');

  const categories = useMemo(() => {
    const allCategories = new Set(initialProducts
        .filter(p => p.status === ProductStatus.PUBLISHED || p.status === ProductStatus.UNAVAILABLE || p.status === ProductStatus.PRE_ORDER)
        .map(p => p.category)
        .filter(Boolean));
    return ['Semua', ...Array.from(allCategories)];
  }, [initialProducts]);

  const displayedProducts = useMemo(() => {
    let filtered = initialProducts.filter(p => 
        p.status === ProductStatus.PUBLISHED || 
        p.status === ProductStatus.UNAVAILABLE ||
        p.status === ProductStatus.PRE_ORDER
    );

    if (activeCategory !== 'Semua') {
        filtered = filtered.filter(p => p.category === activeCategory);
    }

    return [...filtered].sort((a, b) => {
        switch (activeSort) {
            case 'harga-terendah':
                return getSortPrice(a) - getSortPrice(b);
            case 'harga-tertinggi':
                return getSortPrice(b) - getSortPrice(a);
            case 'terbaru':
            default:
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
    });

  }, [initialProducts, activeCategory, activeSort]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">Katalog Produk</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">Selamat datang di {storefrontSettings.name}. Jelahi produk terbaik kami.</p>
        
        {/* UI Filter & Sorting */}
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center overflow-x-auto pb-2 -mb-2">
                    <div className="flex space-x-2 whitespace-nowrap">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                    activeCategory === category
                                        ? 'bg-secondary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <select
                        value={activeSort}
                        onChange={(e) => setActiveSort(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                Urutkan: {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {displayedProducts.map(product => (
              // Fix: Updated href to use the correct /shop/[storeSlug]/product/[productSlug] route structure.
              <Link key={product.id} href={`/shop/${storeSlug}/product/${product.slug}`} legacyBehavior>
                <a className={product.status === ProductStatus.UNAVAILABLE ? 'pointer-events-none' : ''}>
                  <ProductCard product={product} />
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">Tidak Ada Produk</h2>
            <p className="text-gray-600 mt-2">Tidak ada produk yang cocok dengan filter Anda.</p>
          </div>
        )}
      </div>
      <CTASection />
    </>
  );
};

export default PublicView;
