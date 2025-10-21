import React from 'react';
import ProductManagementView from '@/views/admin/ProductManagementView';
import { getAllProductsByStoreId } from '@/lib/data';

const STORE_ID = 'store-id-placeholder'; // Ganti dengan ID toko yang aktif

export default async function AdminProductsPage() {
  const products = await getAllProductsByStoreId(STORE_ID);
  
  return <ProductManagementView initialProducts={products} />;
}