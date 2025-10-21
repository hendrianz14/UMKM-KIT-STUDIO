'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, ProductStatus } from '@/types';
import { getProductPriceRange } from '@/lib/utils';
import { deleteProductAction, updateProductAction } from '@/lib/actions';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { EditIcon } from '@/components/icons/EditIcon';
// ... (import ikon lainnya)
import { EyeIcon } from '@/components/icons/EyeIcon';
import { EyeOffIcon } from '@/components/icons/EyeOffIcon';
import { ExternalLinkIcon } from '@/components/icons/ExternalLinkIcon';
import { DuplicateIcon } from '@/components/icons/DuplicateIcon';


interface ProductManagementViewProps {
    initialProducts: Product[];
}

// Fix: Changed component definition to a standard function to resolve type errors.
const ProductManagementView = ({ initialProducts }: ProductManagementViewProps) => {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    confirmText: 'Konfirmasi',
    confirmButtonClass: 'bg-secondary hover:bg-primary',
  });

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleAction = async (action: () => Promise<any>) => {
    const result = await action();
    if (result.success) {
        router.refresh(); // Re-fetch data dari server
    } else {
        alert(`Aksi gagal: ${result.error}`);
    }
  };

  const handleToggleStatus = (product: Product) => {
    const isVisible = product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER;
    const newStatus = isVisible ? ProductStatus.DRAFT : ProductStatus.PUBLISHED;
    setDialogState({
        isOpen: true,
        title: `Konfirmasi`,
        message: `Anda yakin ingin mengubah status "${product.name}" menjadi ${newStatus}?`,
        onConfirm: () => handleAction(() => updateProductAction({ ...product, status: newStatus })),
        confirmText: 'Ya, Ubah',
        confirmButtonClass: 'bg-secondary hover:bg-primary'
    });
  };

  const handleDelete = (product: Product) => {
    setDialogState({
        isOpen: true,
        title: 'Konfirmasi Hapus',
        message: `Anda yakin ingin menghapus "${product.name}"?`,
        onConfirm: () => handleAction(() => deleteProductAction(product.id)),
        confirmText: 'Ya, Hapus',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    });
  };

  // ... (Sisa JSX dari komponen ProductManagementView.tsx yang lama, dengan `onEditProduct` diganti Link, dan onNewProduct diganti Link)
  
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-primary">Katalog Produk</h1>
            <p className="text-md text-gray-600">Tambah, ubah, dan atur produk Anda.</p>
        </div>
        <Link href="/admin/products/new" className="bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary transition duration-300">
          Tambah Produk
        </Link>
      </div>
      
      {/* ... (Tabel atau Card view seperti di file asli) ... */}
      {/* Contoh baris dalam tabel */}
      {products.map(product => (
        <div key={product.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
            <span>{product.name}</span>
            <div>
                <Link href={`/admin/products/edit/${product.id}`} className="text-primary p-2"><EditIcon /></Link>
                <button onClick={() => handleDelete(product)} className="text-red-600 p-2"><TrashIcon /></button>
            </div>
        </div>
      ))}

      <ConfirmationDialog {...dialogState} onClose={closeDialog} />
    </>
  );
};

export default ProductManagementView;
