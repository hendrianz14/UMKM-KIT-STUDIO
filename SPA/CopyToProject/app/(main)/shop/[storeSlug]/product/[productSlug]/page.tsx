import React from 'react';
import ProductDetailView from '@/views/ProductDetailView';
import { mockProducts, mockStorefrontSettings } from '@/data/mockData'; // Placeholder
import { notFound } from 'next/navigation';
import { Product, StorefrontSettings } from '@/types';

// Di aplikasi riil, ganti mockData dengan fungsi dari lib/data.ts
// import { getProductBySlug, getStoreSettings } from '@/lib/data';

export default async function ProductPage({ params }: { params: { storeSlug: string, productSlug: string } }) {
  
  // Ambil data di server
  const storefrontSettings: StorefrontSettings = mockStorefrontSettings; // await getStoreSettings(params.storeSlug);
  const product: Product | undefined = mockProducts.find(p => p.slug === params.productSlug); // await getProductBySlug(params.productSlug, storefrontSettings.id);
  const allProducts: Product[] = mockProducts; // Diperlukan untuk QuoteDrawer

  if (!product || !storefrontSettings) {
    notFound();
  }

  // Fix: Pass the correct props to the ProductDetailView component as defined in its interface.
  return (
    <ProductDetailView 
      product={product}
      storefrontSettings={storefrontSettings}
      allProducts={allProducts}
      // Fix: Added missing 'storeSlug' and 'productSlug' properties.
      storeSlug={params.storeSlug}
      productSlug={params.productSlug}
    />
  );
}
