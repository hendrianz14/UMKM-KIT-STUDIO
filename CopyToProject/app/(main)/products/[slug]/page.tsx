import React from 'react';
import ProductDetailView from '@/views/ProductDetailView';
import { getProductBySlug, getStoreSettingsBySlug, getAllProductsByStoreId } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Product } from '@/types';

// Fungsi ini membantu Next.js mengetahui produk mana yang akan di-generate saat build
export async function generateStaticParams() {
    // Di aplikasi riil, Anda akan mengambil semua slug produk dari database
    const products = await getAllProductsByStoreId('store-id-placeholder');
    return products.map((product) => ({
      slug: product.slug,
    }));
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  
  const storeSlug = 'toko-saya'; // Ganti dengan logika Anda
  const storefrontSettings = await getStoreSettingsBySlug(storeSlug);

  if (!storefrontSettings) {
    notFound();
  }

  const product = await getProductBySlug(params.slug, 'store-id-placeholder');
  
  // Ambil semua produk untuk konteks keranjang belanja
  const allProducts: Product[] = await getAllProductsByStoreId('store-id-placeholder'); 

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailView 
      product={product}
      storefrontSettings={storefrontSettings}
      allProducts={allProducts}
      // Fix: Added missing 'storeSlug' and 'productSlug' properties.
      storeSlug={storeSlug}
      productSlug={params.slug}
    />
  );
}
