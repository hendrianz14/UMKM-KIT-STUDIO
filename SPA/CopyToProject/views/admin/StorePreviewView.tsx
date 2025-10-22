'use client';

import React from 'react';
import { StorefrontSettings } from '@/types';

interface StorePreviewViewProps {
  settings: StorefrontSettings;
}

// Fix: Changed component definition to a standard function to resolve type errors.
const StorePreviewView = ({ settings }: StorePreviewViewProps) => {
  // Pratinjau sekarang mengarah ke halaman publik yang sebenarnya
  const previewUrl = `/products`;

  return (
    <div className="bg-gray-200/50 rounded-lg shadow-inner border border-gray-200 h-full flex flex-col">
      <div className="bg-white p-3 rounded-t-lg border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold text-primary">Pratinjau Toko</h2>
        <p className="text-sm text-gray-600">
          Ini adalah pratinjau langsung dari halaman toko Anda.
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2 font-semibold">
            Buka di tab baru &rarr;
          </a>
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <iframe
          src={previewUrl}
          title="Pratinjau Toko"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default StorePreviewView;
