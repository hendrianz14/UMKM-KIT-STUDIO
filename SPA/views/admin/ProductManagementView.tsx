import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { formatCurrency, getProductPriceRange } from '../../utils';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { Product, ProductStatus } from '../../types';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { EyeOffIcon } from '../../components/icons/EyeOffIcon';
import { ExternalLinkIcon } from '../../components/icons/ExternalLinkIcon';
import { DuplicateIcon } from '../../components/icons/DuplicateIcon';
import ConfirmationDialog from '../../components/ConfirmationDialog';

interface ProductManagementViewProps {
    onEditProduct: (product: Product) => void;
    onNewProduct: () => void;
}

const ProductManagementView: React.FC<ProductManagementViewProps> = ({ onEditProduct, onNewProduct }) => {
  const { products, deleteProduct, updateProduct, storefrontSettings, duplicateProduct } = useStore();
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Konfirmasi',
    confirmButtonClass: 'bg-secondary hover:bg-primary',
  });

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleToggleStatus = (product: Product) => {
    const isVisible = product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER;
    
    // If it's visible, the action is to hide it (set to Draft).
    // If it's hidden, the action is to publish it (set to Published).
    const newStatus = isVisible ? ProductStatus.DRAFT : ProductStatus.PUBLISHED;
    const actionText = isVisible ? 'menyembunyikan' : 'mempublikasikan';
    const titleText = isVisible ? 'Sembunyikan' : 'Publikasikan';

    setDialogState({
      isOpen: true,
      title: `Konfirmasi ${titleText}`,
      message: `Apakah Anda yakin ingin ${actionText} produk "${product.name}"?`,
      onConfirm: () => updateProduct({ ...product, status: newStatus }),
      confirmText: `Ya, ${titleText}`,
      confirmButtonClass: isVisible ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700',
    });
  };

  const handleDuplicate = (product: Product) => {
    setDialogState({
        isOpen: true,
        title: 'Konfirmasi Duplikasi',
        message: `Apakah Anda yakin ingin menduplikasi produk "${product.name}"? Salinan baru akan dibuat sebagai draft.`,
        onConfirm: () => duplicateProduct(product.id),
        confirmText: 'Ya, Duplikat',
        confirmButtonClass: 'bg-secondary hover:bg-primary',
    });
  };

  const handleDelete = (product: Product) => {
    setDialogState({
        isOpen: true,
        title: 'Konfirmasi Hapus',
        message: `Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat diurungkan.`,
        onConfirm: () => deleteProduct(product.id),
        confirmText: 'Ya, Hapus',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    });
  };


  const getStatusChip = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.PUBLISHED:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>;
      case ProductStatus.DRAFT:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>;
      case ProductStatus.UNLISTED:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unlisted</span>;
      case ProductStatus.UNAVAILABLE:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Tidak Tersedia</span>;
      case ProductStatus.PRE_ORDER:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Pre-Order</span>;
      default:
        return null;
    }
  };

  const handleViewPublic = (product: Product) => {
    const url = `/shop/${storefrontSettings.slug}/product/${product.slug}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Katalog Produk</h1>
            <p className="text-md text-gray-600">Tambah, ubah, dan atur produk yang Anda jual.</p>
        </div>
        <button onClick={onNewProduct} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary transition duration-300 self-start sm:self-auto">
          Tambah Produk
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Diubah</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const coverImage = product.images.find(img => img.id === product.coverImageId) || product.images[0];
                const { displayPrice } = getProductPriceRange(product);
                const isVisible = product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER;
                
                return (
                    <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            {coverImage ? (
                                <img className="h-10 w-10 rounded-md object-cover" src={coverImage.url} alt={coverImage.altText || product.name} />
                            ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200"></div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{displayPrice}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusChip(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.updatedAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                          {(product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER) && (
                            <button onClick={() => handleViewPublic(product)} className="text-gray-400 hover:text-gray-600" title="Lihat Halaman Publik">
                                <ExternalLinkIcon />
                            </button>
                          )}
                          <button onClick={() => handleToggleStatus(product)} className="text-gray-400 hover:text-gray-600" title={isVisible ? 'Sembunyikan' : 'Publikasikan'}>
                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                          <button onClick={() => handleDuplicate(product)} className="text-gray-400 hover:text-gray-600" title="Duplikat Produk">
                            <DuplicateIcon />
                          </button>
                        <button onClick={() => onEditProduct(product)} className="text-primary hover:text-secondary" title="Edit Produk">
                            <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(product)} className="text-red-600 hover:text-red-900" title="Hapus Produk">
                            <TrashIcon />
                        </button>
                        </div>
                    </td>
                    </tr>
                )
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map((product) => {
            const coverImage = product.images.find(img => img.id === product.coverImageId) || product.images[0];
            const { displayPrice } = getProductPriceRange(product);
            const isVisible = product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER;

            return (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            {coverImage ? (
                                <img className="h-16 w-16 rounded-md object-cover" src={coverImage.url} alt={coverImage.altText || product.name} />
                            ) : (
                                <div className="h-16 w-16 rounded-md bg-gray-200"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{displayPrice}</p>
                            <div className="mt-2">
                                {getStatusChip(product.status)}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Diubah: {new Date(product.updatedAt).toLocaleDateString('id-ID')}
                        </p>
                        <div className="flex items-center space-x-3">
                            {(product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNAVAILABLE || product.status === ProductStatus.PRE_ORDER) && (
                                <button onClick={() => handleViewPublic(product)} className="text-gray-500 hover:text-gray-700 p-1" title="Lihat Halaman Publik">
                                    <ExternalLinkIcon />
                                </button>
                            )}
                            <button onClick={() => handleToggleStatus(product)} className="text-gray-500 hover:text-gray-700 p-1" title={isVisible ? 'Sembunyikan' : 'Publikasikan'}>
                                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                             <button onClick={() => handleDuplicate(product)} className="text-gray-500 hover:text-gray-700 p-1" title="Duplikat Produk">
                                <DuplicateIcon />
                            </button>
                            <button onClick={() => onEditProduct(product)} className="text-primary hover:text-secondary p-1" title="Edit Produk">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleDelete(product)} className="text-red-600 hover:text-red-800 p-1" title="Hapus Produk">
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )
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