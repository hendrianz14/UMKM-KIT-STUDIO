'use client';

import React, { useMemo, useState } from 'react';
import ProductsLayoutClient from '@/components/ProductsLayoutClient';
import ProductCard from '@/components/ProductCard';
import ProductEditView from '@/components/admin/ProductEditView';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import type { StorefrontProduct, StorefrontProductInput } from '@/types/storefront.types';

const ProductManagementView: React.FC = () => {
  const {
    storefront,
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    isMutating,
  } = useStorefrontContext();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(products.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editingProduct = useMemo<StorefrontProduct | null>(() => {
    if (!editingProductId) {
      return null;
    }
    return products.find((product) => product.id === editingProductId) ?? null;
  }, [editingProductId, products]);

  const handleCreateNew = () => {
    setEditingProductId(null);
    setIsCreating(true);
  };

  const handleEdit = (productId: string) => {
    setIsCreating(false);
    setEditingProductId(productId);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProductId(null);
    setErrorMessage(null);
  };

  const handleSave = async (input: StorefrontProductInput, productId?: string) => {
    setErrorMessage(null);
    try {
      if (productId) {
        await updateProduct(productId, input);
      } else {
        const newProduct = await createProduct(input);
        setEditingProductId(newProduct.id);
      }
      setIsCreating(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan produk.';
      setErrorMessage(message);
    }
  };

  const handleDelete = async (productId: string) => {
    setErrorMessage(null);
    try {
      await deleteProduct(productId);
      if (editingProductId === productId) {
        setEditingProductId(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus produk.';
      setErrorMessage(message);
    }
  };

  const handleDuplicate = async (productId: string) => {
    setErrorMessage(null);
    try {
      const product = await duplicateProduct(productId);
      setEditingProductId(product.id);
      setIsCreating(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menduplikasi produk.';
      setErrorMessage(message);
    }
  };

  const listSection = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Katalog Produk</h2>
          <p className="text-sm text-blue-400">
            {storefront
              ? `Tersedia ${products.length} produk pada storefront ${storefront.name}.`
              : 'Siapkan produk untuk storefront Anda.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary"
        >
          Tambah Produk
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-10 text-center text-sm text-blue-500">
          Belum ada produk. Klik <strong>Tambah Produk</strong> untuk mulai mengisi katalog Anda.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isActive={product.id === editingProductId && !isCreating}
              onEdit={() => handleEdit(product.id)}
              onDelete={() => handleDelete(product.id)}
              onDuplicate={() => handleDuplicate(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const editorSection = (
    <ProductEditView
      product={isCreating ? null : editingProduct}
      isSaving={isMutating}
      onCancel={handleCancel}
      onSubmit={handleSave}
      errorMessage={errorMessage}
    />
  );

  return <ProductsLayoutClient list={listSection} editor={editorSection} />;
};

export default ProductManagementView;

