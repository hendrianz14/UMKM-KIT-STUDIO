import React from 'react';
import ProductEditView from '@/views/admin/ProductEditView';
import { getAllProductsByStoreId } from '@/lib/data';

const STORE_ID = 'store-id-placeholder';

export default async function NewProductPage() {
  // Mengambil semua produk diperlukan untuk validasi nama duplikat di sisi klien
  const allProducts = await getAllProductsByStoreId(STORE_ID);

  return <ProductEditView productToEdit={null} allProducts={allProducts} />;
}