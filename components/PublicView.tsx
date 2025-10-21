'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import ProductCard from './ProductCard';
import CTASection from './CTASection';
import { getSortPrice } from '@/lib/utils.client';
import { Product, ProductStatus, StorefrontSettings } from '@/types/storefront.types';

interface PublicViewProps {
  storeSlug: string;
  isPreviewMode?: boolean;
  onProductSelect?: (productSlug: string) => void;
  // Fix: Added optional props for Next.js compatibility.
  storefrontSettings?: StorefrontSettings;
  initialProducts?: Product[];
}

const sortOptions = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-terendah', label: 'Harga Terendah' },
    { value: 'harga-tertinggi', label: 'Harga Tertinggi' },
];

const PublicView: React.FC<PublicViewProps> = ({ storeSlug, isPreviewMode = false, onProductSelect, storefrontSettings: settingsProp, initialProducts }) => {
  const router = useRouter();
  // Fix: Prioritize passed props, fallback to context for CRA compatibility.
  const { storefrontSettings: settingsContext, products: productsContext } = useStore();
  const storefrontSettings = settingsProp || settingsContext;
  const products = initialProducts || productsContext;

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSort, setActiveSort] = useState('terbaru');

  const categories = useMemo(() => {
    const allCategories = new Set(products
        .filter(p => p.status === ProductStatus.PUBLISHED || p.status === ProductStatus.UNAVAILABLE || p.status === ProductStatus.PRE_ORDER)
        .map(p => p.category)
        .filter(Boolean));
    return ['Semua', ...Array.from(allCategories)];
  }, [products]);

  const displayedProducts = useMemo(() => {
    let filtered = products.filter(p => 
        p.status === ProductStatus.PUBLISHED || 
        p.status === ProductStatus.UNAVAILABLE ||
        p.status === ProductStatus.PRE_ORDER
    );

    if (activeCategory !== 'Semua') {
        filtered = filtered.filter(p => p.category === activeCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [products, activeCategory, activeSort]);

  if (storefrontSettings.slug !== storeSlug || storefrontSettings.status === 'Off' || !storefrontSettings.isCatalogEnabled) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">Toko Sedang Tutup</h1>
                <p className="text-gray-600 mt-2">Toko tidak ditemukan atau sedang tidak aktif saat ini. Silakan coba lagi nanti.</p>
            </div>
        </div>
    );
  }

  const handleProductSelect = (product: Product) => {
    if (product.status === ProductStatus.UNAVAILABLE) return; // Prevent navigation for unavailable items

    if (isPreviewMode && onProductSelect) {
      onProductSelect(product.slug);
      return;
    }

    router.push(`/shop/${storeSlug}/product/${product.slug}`);
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">Katalog Produk</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">Selamat datang di {storefrontSettings.name}. Jelajahi produk terbaik kami.</p>
        
        {/* Filters and Sorting */}
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Category Filters */}
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

                {/* Sort Dropdown */}
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
              <ProductCard key={product.id} product={product} onSelect={() => handleProductSelect(product)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">Tidak Ada Produk</h2>
            <p className="text-gray-600 mt-2">Tidak ada produk yang cocok dengan filter Anda. Coba pilih kategori lain.</p>
          </div>
        )}
      </div>
      <CTASection />
    </>
  );
};

export default PublicView;
