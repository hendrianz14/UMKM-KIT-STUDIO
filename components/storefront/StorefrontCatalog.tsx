'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StorefrontFooter from './StorefrontFooter';
import ProductCard from './ProductCard';
import { useStorefront } from './StorefrontProvider';
import { ProductStatus, StorefrontStatus } from '@/lib/storefront/types';
import { getSortPrice } from '@/lib/storefront/utils';

interface StorefrontCatalogProps {
  storeSlug: string;
  isPreviewMode?: boolean;
  onProductSelect?: (productSlug: string) => void;
}

const sortOptions = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'harga-terendah', label: 'Harga Terendah' },
  { value: 'harga-tertinggi', label: 'Harga Tertinggi' },
];

const StorefrontCatalog = ({
  storeSlug,
  isPreviewMode = false,
  onProductSelect,
}: StorefrontCatalogProps) => {
  const router = useRouter();
  const { storefront, products } = useStorefront();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSort, setActiveSort] = useState('terbaru');

  const categories = useMemo(() => {
    const allCategories = new Set(
      products
        .filter((product) =>
          [ProductStatus.PUBLISHED, ProductStatus.UNAVAILABLE, ProductStatus.PRE_ORDER].includes(
            product.status,
          ),
        )
        .map((product) => product.category)
        .filter(Boolean),
    );
    return ['Semua', ...Array.from(allCategories)];
  }, [products]);

  const displayedProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      [ProductStatus.PUBLISHED, ProductStatus.UNAVAILABLE, ProductStatus.PRE_ORDER].includes(
        product.status,
      ),
    );

    if (activeCategory !== 'Semua') {
      filtered = filtered.filter((product) => product.category === activeCategory);
    }

    return [...filtered].sort((a, b) => {
      switch (activeSort) {
        case 'harga-terendah':
          return getSortPrice(a) - getSortPrice(b);
        case 'harga-tertinggi':
          return getSortPrice(b) - getSortPrice(a);
        case 'terbaru':
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [products, activeCategory, activeSort]);

  const handleProductSelect = (productSlug: string) => {
    if (isPreviewMode && onProductSelect) {
      onProductSelect(productSlug);
      return;
    }
    router.push(`/shop/${storeSlug}/product/${productSlug}`);
  };

  if (
    storefront.slug !== storeSlug ||
    storefront.status === StorefrontStatus.OFF ||
    !storefront.isCatalogEnabled
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg bg-white p-10 text-center shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Toko Sedang Tutup</h1>
          <p className="mt-2 text-gray-600">
            Toko tidak ditemukan atau sedang tidak aktif saat ini. Silakan coba lagi
            nanti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Katalog Produk
        </h1>
        <p className="mb-8 text-base text-gray-600 sm:text-lg">
          Selamat datang di {storefront.name}. Jelajahi produk terbaik kami.
        </p>

        <div className="mb-8 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center overflow-x-auto pb-2 sm:-mb-2">
            <div className="flex space-x-2 whitespace-nowrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category
                      ? 'bg-secondary text-white'
                      : 'border bg-white text-gray-700 hover:bg-gray-100'
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
              onChange={(event) => setActiveSort(event.target.value)}
              className="w-full rounded-full border px-4 py-2 text-sm font-semibold text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-secondary sm:w-auto"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Urutkan: {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => handleProductSelect(product.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white py-20 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">
              Tidak Ada Produk
            </h2>
            <p className="mt-2 text-gray-600">
              Tidak ada produk yang cocok dengan filter Anda. Coba pilih kategori
              lain.
            </p>
          </div>
        )}
      </div>
      {!isPreviewMode && <StorefrontFooter />}
    </>
  );
};

export default StorefrontCatalog;
