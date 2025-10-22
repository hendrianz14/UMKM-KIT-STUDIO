'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useStorefront } from '../StorefrontProvider';
import { getProductPriceRange } from '@/lib/storefront/utils';
import {
  Product,
  ProductStatus,
} from '@/lib/storefront/types';
import TrashIcon from '../icons/TrashIcon';
import EditIcon from '../icons/EditIcon';
import EyeIcon from '../icons/EyeIcon';
import EyeOffIcon from '../icons/EyeOffIcon';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import DuplicateIcon from '../icons/DuplicateIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface ProductManagementViewProps {
  onEditProduct: (product: Product) => void;
  onNewProduct: () => void;
}

const ProductManagementView = ({
  onEditProduct,
  onNewProduct,
}: ProductManagementViewProps) => {
  const {
    products,
    deleteProduct,
    updateProduct,
    duplicateProduct,
    storefront,
  } = useStorefront();

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Konfirmasi',
    confirmButtonClass: 'bg-secondary hover:bg-primary',
  });

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const productsSorted = useMemo(
    () =>
      [...products].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [products],
  );

  const handleToggleStatus = (product: Product) => {
    const isVisible =
      product.status === ProductStatus.PUBLISHED ||
      product.status === ProductStatus.UNAVAILABLE ||
      product.status === ProductStatus.PRE_ORDER;
    const newStatus = isVisible ? ProductStatus.DRAFT : ProductStatus.PUBLISHED;
    const actionText = isVisible ? 'menyembunyikan' : 'mempublikasikan';
    const titleText = isVisible ? 'Sembunyikan' : 'Publikasikan';

    setDialogState({
      isOpen: true,
      title: `Konfirmasi ${titleText}`,
      message: `Apakah Anda yakin ingin ${actionText} produk "${product.name}"?`,
      onConfirm: () => {
        void updateProduct({ ...product, status: newStatus });
      },
      confirmText: `Ya, ${titleText}`,
      confirmButtonClass: isVisible
        ? 'bg-yellow-600 hover:bg-yellow-700'
        : 'bg-green-600 hover:bg-green-700',
    });
  };

  const handleDuplicate = (product: Product) => {
    setDialogState({
      isOpen: true,
      title: 'Konfirmasi Duplikasi',
      message: `Apakah Anda yakin ingin menduplikasi produk "${product.name}"? Salinan baru akan dibuat sebagai draft.`,
      onConfirm: () => {
        void duplicateProduct(product.id);
      },
      confirmText: 'Ya, Duplikat',
      confirmButtonClass: 'bg-secondary hover:bg-primary',
    });
  };

  const handleDelete = (product: Product) => {
    setDialogState({
      isOpen: true,
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat diurungkan.`,
      onConfirm: () => {
        void deleteProduct(product.id);
      },
      confirmText: 'Ya, Hapus',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    });
  };

  const getStatusChip = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.PUBLISHED:
        return (
          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
            Published
          </span>
        );
      case ProductStatus.DRAFT:
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
            Draft
          </span>
        );
      case ProductStatus.UNLISTED:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
            Unlisted
          </span>
        );
      case ProductStatus.UNAVAILABLE:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
            Tidak Tersedia
          </span>
        );
      case ProductStatus.PRE_ORDER:
        return (
          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
            Pre-Order
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewPublic = (product: Product) => {
    const url = `/shop/${storefront.slug}/product/${product.slug}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Katalog Produk</h1>
          <p className="text-md text-gray-600">
            Tambah, ubah, dan atur produk yang Anda jual.
          </p>
        </div>
        <button
          onClick={onNewProduct}
          className="self-start rounded-lg bg-secondary px-4 py-2 font-bold text-white shadow-md transition duration-300 hover:bg-primary sm:self-auto"
        >
          Tambah Produk
        </button>
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow-md md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Produk
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Harga
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Terakhir Diubah
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {productsSorted.map((product) => {
                const coverImage =
                  product.images.find(
                    (image) => image.id === product.coverImageId,
                  ) ?? product.images[0];
                const { displayPrice } = getProductPriceRange(product);
                const isVisible =
                  product.status === ProductStatus.PUBLISHED ||
                  product.status === ProductStatus.UNAVAILABLE ||
                  product.status === ProductStatus.PRE_ORDER;

                return (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                          {coverImage ? (
                            <Image
                              src={coverImage.url}
                              alt={coverImage.altText || product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : null}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category || 'Tidak ada kategori'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {getStatusChip(product.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {displayPrice}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-end space-x-3 text-sm text-gray-400">
                        {isVisible && (
                          <button
                            onClick={() => handleViewPublic(product)}
                            className="transition hover:text-gray-600"
                            title="Lihat Halaman Publik"
                          >
                            <ExternalLinkIcon />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="transition hover:text-gray-600"
                          title={isVisible ? 'Sembunyikan' : 'Publikasikan'}
                        >
                          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="transition hover:text-gray-600"
                          title="Duplikat Produk"
                        >
                          <DuplicateIcon />
                        </button>
                        <button
                          onClick={() => onEditProduct(product)}
                          className="text-primary transition hover:text-secondary"
                          title="Edit Produk"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 transition hover:text-red-900"
                          title="Hapus Produk"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {productsSorted.map((product) => {
          const coverImage =
            product.images.find((image) => image.id === product.coverImageId) ??
            product.images[0];
          const { displayPrice } = getProductPriceRange(product);
          const isVisible =
            product.status === ProductStatus.PUBLISHED ||
            product.status === ProductStatus.UNAVAILABLE ||
            product.status === ProductStatus.PRE_ORDER;

          return (
            <div key={product.id} className="rounded-lg bg-white p-4 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                  {coverImage ? (
                    <Image
                      src={coverImage.url}
                      alt={coverImage.altText || product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{displayPrice}</p>
                  <div className="mt-2">{getStatusChip(product.status)}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500">
                  Diubah:{' '}
                  {new Date(product.updatedAt).toLocaleDateString('id-ID')}
                </p>
                <div className="flex items-center space-x-3">
                  {isVisible && (
                    <button
                      onClick={() => handleViewPublic(product)}
                      className="p-1 text-gray-500 transition hover:text-gray-700"
                      title="Lihat Halaman Publik"
                    >
                      <ExternalLinkIcon />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="p-1 text-gray-500 transition hover:text-gray-700"
                    title={isVisible ? 'Sembunyikan' : 'Publikasikan'}
                  >
                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="p-1 text-gray-500 transition hover:text-gray-700"
                    title="Duplikat Produk"
                  >
                    <DuplicateIcon />
                  </button>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1 text-primary transition hover:text-secondary"
                    title="Edit Produk"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-1 text-red-600 transition hover:text-red-800"
                    title="Hapus Produk"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        confirmButtonClass={dialogState.confirmButtonClass}
      />
    </>
  );
};

export default ProductManagementView;
