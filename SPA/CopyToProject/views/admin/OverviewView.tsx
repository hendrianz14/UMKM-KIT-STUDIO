'use client';

import React from 'react';
import { Product, ProductStatus, StorefrontSettings } from '@/types';
import { TagIcon } from '@/components/icons/TagIcon';
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';

interface OverviewViewProps {
    initialProducts: Product[];
    // Fix: Added storefrontSettings to props to receive data from server component.
    storefrontSettings: StorefrontSettings;
}

// Fix: Changed component definition to a standard function to resolve type errors.
const OverviewView = ({ initialProducts, storefrontSettings }: OverviewViewProps) => {
  const publishedProducts = initialProducts.filter(p => p.status === ProductStatus.PUBLISHED).length;
  const draftProducts = initialProducts.filter(p => p.status === ProductStatus.DRAFT).length;
  const totalProducts = initialProducts.length;
  const isStoreLive = storefrontSettings.status === "Published";
  const storefrontUrl = `/products`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">Selamat Datang Kembali</h1>
      <p className="text-md text-gray-600 mb-8">Berikut ringkasan dari toko Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Store Status Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${isStoreLive ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {isStoreLive ? <CheckCircleIcon /> : <AlertTriangleIcon />}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status Toko</p>
              <p className={`text-2xl font-bold ${isStoreLive ? 'text-green-600' : 'text-yellow-600'}`}>
                {storefrontSettings.status}
              </p>
            </div>
          </div>
          {isStoreLive && (
              <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm text-primary hover:underline">
                  Lihat Toko &rarr;
              </a>
          )}
        </div>

        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TagIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        {/* Product Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rincian Produk</h3>
          <div className="space-y-3">
              <div className="flex justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="font-semibold text-green-600">{publishedProducts}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-gray-600">Draft</span>
                  <span className="font-semibold text-yellow-600">{draftProducts}</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
