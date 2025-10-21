import React from 'react';
import PublicView from '@/views/PublicView'; // Asumsi views/PublicView diadaptasi
import { mockProducts, mockStorefrontSettings } from '@/data/mockData'; // Placeholder
import { notFound } from 'next/navigation';
import { Product, StorefrontSettings } from '@/types';

// Di aplikasi riil, ganti mockData dengan fungsi dari lib/data.ts
// import { getPublicProducts, getStoreSettings } from '@/lib/data';

// Fungsi ini memberi tahu Next.js slug mana yang harus di-generate saat build
export async function generateStaticParams() {
    // Di sini Anda akan mengambil semua slug toko dari database
    return [{ storeSlug: 'toko-saya' }];
}

export default async function StoreCatalogPage({ params }: { params: { storeSlug:string } }) {
  
  // Ambil data di server
  const storefrontSettings: StorefrontSettings = mockStorefrontSettings; // await getStoreSettings(params.storeSlug);
  const products: Product[] = mockProducts; // await getPublicProducts(storefrontSettings.id);

  if (!storefrontSettings) {
    notFound();
  }

  // Fix: Pass the correct props to the PublicView component as defined in its interface.
  return (
    <PublicView 
      storefrontSettings={storefrontSettings}
      initialProducts={products}
      // Fix: Added missing 'storeSlug' property.
      storeSlug={params.storeSlug}
    />
  );
}
