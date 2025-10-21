import React from 'react';
import PublicView from '@/views/PublicView';
import { getPublicProductsByStoreId, getStoreSettingsBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';

// Halaman ini akan menjadi halaman utama toko Anda, misal: domain.com/products
export default async function ProductsCatalogPage() {
  
  // Ganti 'toko-saya' dengan slug toko default atau ambil dari parameter/domain
  const storeSlug = 'toko-saya';
  
  const storefrontSettings = await getStoreSettingsBySlug(storeSlug);

  if (!storefrontSettings) {
    notFound();
  }
  
  // Ganti 'store-id-placeholder' dengan ID toko yang sesuai
  const products = await getPublicProductsByStoreId('store-id-placeholder');

  return (
    <PublicView 
      storefrontSettings={storefrontSettings}
      initialProducts={products}
      // Fix: Added missing 'storeSlug' property.
      storeSlug={storeSlug}
    />
  );
}
