'use client';

import React from 'react';
import PublicView from '@/components/PublicView';

const StorePreviewView: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Pratinjau Storefront</h2>
        <p className="mt-2 text-sm text-blue-400">
          Tinjau tampilan publik toko Anda. Perubahan produk dan pengaturan branding akan langsung
          tercermin di sini.
        </p>
      </header>
      <div className="overflow-hidden rounded-3xl border border-blue-100 shadow-lg">
        <PublicView />
      </div>
    </div>
  );
};

export default StorePreviewView;

