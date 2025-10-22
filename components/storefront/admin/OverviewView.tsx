'use client';

import { useMemo } from 'react';
import { useStorefront } from '../StorefrontProvider';
import { ProductStatus, StorefrontStatus } from '@/lib/storefront/types';
import TagIcon from '../icons/TagIcon';
import AlertTriangleIcon from '../icons/AlertTriangleIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

const OverviewView = () => {
  const { products, storefront } = useStorefront();

  const { publishedProducts, draftProducts, totalProducts } = useMemo(() => {
    const published = products.filter(
      (product) => product.status === ProductStatus.PUBLISHED,
    ).length;
    const drafts = products.filter(
      (product) => product.status === ProductStatus.DRAFT,
    ).length;
    return {
      publishedProducts: published,
      draftProducts: drafts,
      totalProducts: products.length,
    };
  }, [products]);

  const isStoreLive = storefront.status === StorefrontStatus.PUBLISHED;
  const storefrontHref = `/shop/${storefront.slug}`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">Selamat Datang Kembali</h1>
      <p className="mb-8 text-md text-gray-600">
        Berikut ringkasan dari toko Anda.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 ${isStoreLive ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
            >
              {isStoreLive ? <CheckCircleIcon /> : <AlertTriangleIcon />}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status Toko</p>
              <p
                className={`text-2xl font-bold ${isStoreLive ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {storefront.status}
              </p>
            </div>
          </div>
          {isStoreLive && (
            <a
              href={storefrontHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-sm text-primary hover:underline"
            >
              Lihat Toko &rarr;
            </a>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <TagIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Rincian Produk
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">
                {publishedProducts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Draft</span>
              <span className="font-semibold text-yellow-600">
                {draftProducts}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
