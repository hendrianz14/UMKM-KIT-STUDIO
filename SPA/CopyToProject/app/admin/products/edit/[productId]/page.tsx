import React from 'react';
import ProductEditView from '@/views/admin/ProductEditView';
import { getAllProductsByStoreId } from '@/lib/data';
import { notFound } from 'next/navigation';

const STORE_ID = 'store-id-placeholder'; // Ganti dengan ID toko yang aktif

// Fungsi ini akan mengambil data produk tunggal berdasarkan ID
async function getProductById(id: string) {
    const products = await getAllProductsByStoreId(STORE_ID);
    return products.find(p => p.id === id) || null;
}

export default async function EditProductPage({ params }: { params: { productId: string } }) {
  const product = await getProductById(params.productId);
  const allProducts = await getAllProductsByStoreId(STORE_ID);

  if (!product) {
    notFound();
  }

  return <ProductEditView productToEdit={product} allProducts={allProducts} />;
}