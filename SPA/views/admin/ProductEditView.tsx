import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, ProductImage, ProductStatus, PriceType, VariantGroup, VariantCombination, ProductFAQ, StockStatus, ProductSpec } from '../../types';
import { useStore } from '../../hooks/useStore';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { StarIcon } from '../../components/icons/StarIcon';
import { ImagePlusIcon } from '../../components/icons/ImagePlusIcon';
import { ExternalLinkIcon } from '../../components/icons/ExternalLinkIcon';
import PreviewView from './PreviewView';
import { EyeIcon } from '../../components/icons/EyeIcon';

interface ProductEditViewProps {
  productToEdit: Product | null;
  onBack: () => void;
}

const generateCombinations = (groups: VariantGroup[]): VariantCombination[] => {
    if (groups.length === 0 || groups.some(g => g.options.length === 0)) return [];
  
    const combinations: Record<string, string>[] = [];
    const recursion = (index: number, currentCombination: Record<string, string>) => {
      if (index === groups.length) {
        combinations.push(currentCombination);
        return;
      }
      const group = groups[index];
      for (const option of group.options) {
        const newCombination = { ...currentCombination, [group.name]: option };
        recursion(index + 1, newCombination);
      }
    };
    recursion(0, {});
  
    return combinations.map((combo, i) => ({
      id: `combo-${Date.now()}-${i}`,
      options: combo,
      price: 0,
      askOnWA: false,
      stockStatus: StockStatus.AVAILABLE,
    }));
};
  
const emptyProduct: Omit<Product, 'id' | 'slug' | 'updatedAt'> = {
    name: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    status: ProductStatus.DRAFT,
    images: [],
    badges: [],
    priceType: PriceType.SINGLE,
    price: 0,
    variants: { groups: [], combinations: [] },
    specs: [],
    faq: [],
    preOrderEstimate: '',
};

const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";

const ProductEditView: React.FC<ProductEditViewProps> = ({ productToEdit, onBack }) => {
  const { addProduct, updateProduct, storefrontSettings, products: allProducts } = useStore();
  const [product, setProduct] = useState<Product | Omit<Product, 'id' | 'slug' | 'updatedAt'>>(() => productToEdit || emptyProduct);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    if (!product.name.trim()) {
        setNameError('');
        return;
    }

    const isDuplicate = allProducts.some(p => {
        // When editing, exclude the product itself from the check
        if ('id' in product && p.id === product.id) {
            return false;
        }
        return p.name.trim().toLowerCase() === product.name.trim().toLowerCase();
    });

    if (isDuplicate) {
        setNameError('Nama produk sudah ada. Harap gunakan nama lain.');
    } else {
        setNameError('');
    }
}, [product.name, allProducts, product]);


  const canPublish = useMemo(() => {
    if (!product.name.trim() || nameError) return false;
    if (product.images.length === 0) return false;
    if (product.priceType === PriceType.SINGLE && (product.price ?? 0) <= 0) return false;
    if (product.priceType === PriceType.VARIANT) {
        if (product.variants.combinations.length === 0) return false;
        const hasInvalidPrice = product.variants.combinations.some(
            c => c.stockStatus === StockStatus.AVAILABLE && !c.askOnWA && c.price <= 0
        );
        if (hasInvalidPrice) return false;
    }
    return true;
  }, [product, nameError]);

  const canMakeVisible = useMemo(() => {
    // For non-published visible states, we might only need name and photo.
    if (!product.name.trim() || nameError) return false;
    if (product.images.length === 0) return false;
    return true;
  }, [product, nameError]);

  const isPrimaryActionDisabled = useMemo(() => {
    // The validation should be based on the status the user has currently selected.
    const targetStatus = product.status;
    if (targetStatus === ProductStatus.PUBLISHED) {
        return !canPublish;
    }
    // For other visible statuses, the requirements might be less strict.
    if (targetStatus === ProductStatus.UNAVAILABLE || targetStatus === ProductStatus.UNLISTED || targetStatus === ProductStatus.PRE_ORDER) {
        return !canMakeVisible;
    }
    // You can always save as a Draft.
    return false;
  }, [product.status, canPublish, canMakeVisible]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(p => ({ ...p, [name]: value }));
  };

  const handleSave = (newStatus?: ProductStatus) => {
    const finalStatus = newStatus || product.status;
    
    // Prevent saving as published if there's a name error, but allow other statuses.
    if (finalStatus === ProductStatus.PUBLISHED && nameError) return;

    const productToSave = { ...product, status: finalStatus };
    
    if ('id' in productToSave) {
        updateProduct(productToSave as Product);
    } else {
        addProduct(productToSave as Omit<Product, 'id' | 'slug' | 'updatedAt'>);
    }
    onBack();
  };
  
  const handlePrimaryAction = () => {
    // The primary action should save the product with the status that is
    // currently selected in the dropdown.
    handleSave();
  };


  const handleViewPublic = () => {
    if (productToEdit) {
      const url = `/shop/${storefrontSettings.slug}/product/${productToEdit.slug}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Media Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Harap pilih file gambar.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        addImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = (imageUrl: string) => {
    if (product.images.length >= 6) return;
    const newImage: ProductImage = { id: `img-${Date.now()}`, url: imageUrl, altText: '' };
    const newImages = [...product.images, newImage];
    const coverId = product.images.length === 0 ? newImage.id : product.coverImageId;
    setProduct(p => ({ ...p, images: newImages, coverImageId: coverId }));
  };


  const updateImage = (id: string, altText: string) => {
    setProduct(p => ({ ...p, images: p.images.map(img => img.id === id ? { ...img, altText } : img) }));
  };

  const removeImage = (id: string) => {
    setProduct(p => {
        const newImages = p.images.filter(img => img.id !== id);
        // If the cover image was removed, pick the new first one, or none.
        const newCoverId = p.coverImageId === id ? (newImages[0]?.id || undefined) : p.coverImageId;
        return { ...p, images: newImages, coverImageId: newCoverId };
    });
  };

  const setCoverImage = (id: string) => {
    setProduct(p => ({ ...p, coverImageId: id }));
  };

  // Variants handlers
  useEffect(() => {
    if (product.priceType === PriceType.VARIANT) {
        const newCombinations = generateCombinations(product.variants.groups);
        
        const updatedCombinations = newCombinations.map(newCombo => {
            const oldCombo = product.variants.combinations.find(old => 
                JSON.stringify(old.options) === JSON.stringify(newCombo.options)
            );
            return oldCombo || newCombo;
        });

        setProduct(p => ({ ...p, variants: { ...p.variants, combinations: updatedCombinations } }));
    }
  }, [product.priceType, product.variants.groups]);
  
  const addVariantGroup = () => {
    const newGroup: VariantGroup = { id: `vg-${Date.now()}`, name: '', options: [] };
    setProduct(p => ({...p, variants: { ...p.variants, groups: [...p.variants.groups, newGroup] }}));
  };

  const updateVariantGroup = (id: string, name: string) => {
      setProduct(p => ({ ...p, variants: { ...p.variants, groups: p.variants.groups.map(g => g.id === id ? {...g, name} : g)}}));
  };

  const updateVariantGroupOptions = (id: string, optionsStr: string) => {
    const options = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
    setProduct(p => ({...p, variants: { ...p.variants, groups: p.variants.groups.map(g => g.id === id ? {...g, options} : g)}}));
  };
  
  const removeVariantGroup = (id: string) => {
      setProduct(p => ({...p, variants: { ...p.variants, groups: p.variants.groups.filter(g => g.id !== id)}}));
  };

  const updateCombination = (id: string, field: keyof VariantCombination, value: any) => {
    setProduct(p => ({...p, variants: { ...p.variants, combinations: p.variants.combinations.map(c => c.id === id ? {...c, [field]: value} : c)}}));
  };

  const addSpec = () => {
    const newSpec: ProductSpec = { id: `spec-${Date.now()}`, title: '', items: [] };
    setProduct(p => ({ ...p, specs: [...(p.specs || []), newSpec] }));
  };

  const updateSpec = (id: string, field: 'title' | 'items', value: string) => {
    if (field === 'items') {
      const items = value.split(',').map(s => s.trim()).filter(Boolean);
      setProduct(p => ({ ...p, specs: (p.specs || []).map(s => s.id === id ? { ...s, items } : s) }));
    } else {
      setProduct(p => ({ ...p, specs: (p.specs || []).map(s => s.id === id ? { ...s, [field]: value } : s) }));
    }
  };
  
  const removeSpec = (id: string) => {
      setProduct(p => ({...p, specs: (p.specs || []).filter(s => s.id !== id)}));
  };

  // FAQ Handlers
  const addFAQ = () => {
    const newFAQ: ProductFAQ = { id: `faq-${Date.now()}`, question: '', answer: '' };
    setProduct(p => ({ ...p, faq: [...p.faq, newFAQ] }));
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    setProduct(p => ({ ...p, faq: p.faq.map(f => f.id === id ? { ...f, [field]: value } : f) }));
  };
  
  const removeFAQ = (id: string) => {
      setProduct(p => ({...p, faq: p.faq.filter(f => f.id !== id)}));
  };

  if (isPreviewing) {
    return <PreviewView product={product} onBackToEdit={() => setIsPreviewing(false)} />;
  }

  return (
    <>
    <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-sm text-primary hover:underline mb-4">&larr; Kembali ke daftar produk</button>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{productToEdit ? 'Edit Produk' : 'Buat Produk Baru'}</h1>
          {(productToEdit && (productToEdit.status === ProductStatus.PUBLISHED || productToEdit.status === ProductStatus.UNAVAILABLE || productToEdit.status === ProductStatus.PRE_ORDER)) && (
              <button onClick={handleViewPublic} className="flex items-center space-x-2 text-sm text-primary hover:underline mt-2 sm:mt-0">
                  <ExternalLinkIcon />
                  <span>Lihat Halaman Publik</span>
              </button>
          )}
        </div>
        <p className="text-md text-gray-600 mb-8">Isi detail produk secara lengkap di bawah ini.</p>

        <div className="space-y-8">
            {/* Block 1: Info Dasar */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Informasi Dasar</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
                        <input type="text" name="name" value={product.name} onChange={handleChange} className={`${inputStyles} ${nameError ? 'border-red-500' : ''}`} />
                        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat (maks 140 karakter)</label>
                        <textarea name="shortDescription" value={product.shortDescription} onChange={handleChange} maxLength={140} rows={2} className={inputStyles}></textarea>
                        <p className="text-xs text-gray-500 text-right">{product.shortDescription.length}/140</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi Lengkap</label>
                        <textarea name="longDescription" value={product.longDescription} onChange={handleChange} rows={5} className={inputStyles}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Badge (pisahkan dengan koma)</label>
                        <input 
                            type="text" 
                            name="badges" 
                            value={product.badges.join(', ')} 
                            onChange={e => setProduct(p => ({ ...p, badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean) }))} 
                            className={inputStyles} 
                            placeholder="e.g. Best Seller, Baru"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <input type="text" name="category" value={product.category} onChange={handleChange} className={inputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={product.status} onChange={handleChange} className={inputStyles}>
                                <option value={ProductStatus.DRAFT}>Draft</option>
                                <option value={ProductStatus.PUBLISHED}>Published</option>
                                <option value={ProductStatus.PRE_ORDER}>Pre-Order</option>
                                <option value={ProductStatus.UNAVAILABLE}>Tidak Tersedia</option>
                                <option value={ProductStatus.UNLISTED}>Unlisted</option>
                            </select>
                        </div>
                    </div>
                     {product.status === ProductStatus.PRE_ORDER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estimasi Waktu Pengerjaan</label>
                            <input type="text" name="preOrderEstimate" value={product.preOrderEstimate || ''} onChange={handleChange} className={inputStyles} placeholder="e.g. 7 hari kerja" />
                        </div>
                    )}
                </div>
            </div>

            {/* Block 2: Media */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Media</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.images.map(img => (
                        <div key={img.id} className="relative group border rounded-lg p-2 space-y-2">
                             <img src={img.url} alt={img.altText} className="w-full h-32 object-cover rounded"/>
                             <input type="text" placeholder="Alt text" value={img.altText} onChange={e => updateImage(img.id, e.target.value)} className="w-full text-xs p-1 border rounded" />
                             <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setCoverImage(img.id)} className={`p-1 rounded-full ${product.coverImageId === img.id ? 'bg-accent text-white' : 'bg-white/50 hover:bg-white'}`} title="Jadikan Cover">
                                    <StarIcon />
                                </button>
                                <button onClick={() => removeImage(img.id)} className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600" title="Hapus">
                                    <TrashIcon />
                                </button>
                             </div>
                        </div>
                    ))}
                    {product.images.length < 6 && (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp" 
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-full text-gray-500 hover:bg-light py-10">
                                <ImagePlusIcon />
                                <span>Unggah Foto</span>
                            </button>
                        </>
                    )}
                </div>
                 {product.images.length === 0 && <p className="text-sm text-yellow-600 mt-2">Produk perlu minimal 1 foto untuk bisa dipublikasikan.</p>}
            </div>

            {/* Block 3: Varian & Harga */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold border-b pb-2 mb-4">Varian & Harga</h2>
                 <select name="priceType" value={product.priceType} onChange={handleChange} className={`${inputStyles} w-full md:w-1/3 mb-4`}>
                     <option value={PriceType.SINGLE}>Harga Tunggal</option>
                     <option value={PriceType.VARIANT}>Harga Bervariasi</option>
                 </select>

                 {product.priceType === PriceType.SINGLE ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Harga *</label>
                             <input type="number" value={product.price || ''} onChange={e => setProduct(p => ({...p, price: parseFloat(e.target.value) || 0}))} className={inputStyles} />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Harga Coret (Opsional)</label>
                            <input type="number" value={product.strikethroughPrice || ''} onChange={e => setProduct(p => ({...p, strikethroughPrice: parseFloat(e.target.value) || undefined}))} className={inputStyles} />
                        </div>
                     </div>
                 ) : (
                    <div className="space-y-4">
                        {/* Variant Groups */}
                        <div className="space-y-2">
                             {product.variants.groups.map(group => (
                                 <div key={group.id} className="flex flex-col sm:flex-row items-center gap-2 p-2 border rounded">
                                     <input type="text" placeholder="Nama Grup (e.g. Ukuran)" value={group.name} onChange={e => updateVariantGroup(group.id, e.target.value)} className={`${inputStyles} sm:flex-1`} />
                                     <input type="text" placeholder="Opsi, pisahkan dengan koma (e.g. S, M, L)" defaultValue={group.options.join(', ')} onBlur={e => updateVariantGroupOptions(group.id, e.target.value)} className={`${inputStyles} sm:flex-2`} />
                                     <button onClick={() => removeVariantGroup(group.id)} className="text-red-500 p-2"><TrashIcon /></button>
                                 </div>
                             ))}
                             <button onClick={addVariantGroup} className="text-sm text-primary hover:text-secondary flex items-center"><PlusIcon/> Tambah Grup Varian</button>
                        </div>
                        {/* Combinations Table */}
                        {product.variants.combinations.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr>
                                            {product.variants.groups.map(g => <th key={g.id} className="p-2 border-b text-left">{g.name}</th>)}
                                            <th className="p-2 border-b text-left">Harga</th>
                                            <th className="p-2 border-b text-left">Harga Coret</th>
                                            <th className="p-2 border-b text-left">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants.combinations.map(combo => (
                                            <tr key={combo.id}>
                                                {/* Fix: Iterate over groups to maintain column order and resolve type error. */}
                                                {product.variants.groups.map(group => <td key={group.id} className="p-2 border-b">{combo.options[group.name]}</td>)}
                                                <td className="p-2 border-b">
                                                    <input type="number" disabled={combo.askOnWA} value={combo.price} onChange={e => updateCombination(combo.id, 'price', parseFloat(e.target.value))} className={`${inputStyles} w-24 disabled:bg-gray-100`} />
                                                    <div className="text-xs mt-1 whitespace-nowrap"><input type="checkbox" checked={combo.askOnWA} onChange={e => updateCombination(combo.id, 'askOnWA', e.target.checked)} className="mr-1"/> Tanya WA</div>
                                                </td>
                                                <td className="p-2 border-b">
                                                    <input type="number" value={combo.strikethroughPrice || ''} onChange={e => updateCombination(combo.id, 'strikethroughPrice', parseFloat(e.target.value))} className={`${inputStyles} w-24`} />
                                                </td>
                                                <td className="p-2 border-b">
                                                    {/* Fix: Cast e.target.value to StockStatus for type safety. */}
                                                    <select value={combo.stockStatus} onChange={e => updateCombination(combo.id, 'stockStatus', e.target.value as StockStatus)} className={inputStyles}>
                                                        <option value={StockStatus.AVAILABLE}>Tersedia</option>
                                                        <option value={StockStatus.SOLDOUT}>Habis</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                 )}
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold border-b pb-2 mb-4">Spesifikasi Produk</h2>
                 <div className="space-y-4">
                     {(product.specs || []).map(spec => (
                         <div key={spec.id} className="p-2 border rounded space-y-2">
                             <input type="text" placeholder="Judul (e.g. Bahan Utama)" value={spec.title} onChange={e => updateSpec(spec.id, 'title', e.target.value)} className={`${inputStyles} font-semibold`} />
                             <textarea placeholder="Item, pisahkan dengan koma" value={spec.items.join(', ')} onChange={e => updateSpec(spec.id, 'items', e.target.value)} rows={2} className={inputStyles}></textarea>
                             <button onClick={() => removeSpec(spec.id)} className="text-red-500 text-xs float-right p-1">Hapus</button>
                         </div>
                     ))}
                     <button onClick={addSpec} className="text-sm text-primary hover:text-secondary flex items-center"><PlusIcon /> Tambah Spesifikasi</button>
                 </div>
            </div>

            {/* Block 4: FAQ */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold border-b pb-2 mb-4">FAQ Produk</h2>
                 <div className="space-y-4">
                     {product.faq.map(f => (
                         <div key={f.id} className="p-2 border rounded space-y-2">
                             <input type="text" placeholder="Pertanyaan" value={f.question} onChange={e => updateFAQ(f.id, 'question', e.target.value)} className={`${inputStyles} font-semibold`} />
                             <textarea placeholder="Jawaban" value={f.answer} onChange={e => updateFAQ(f.id, 'answer', e.target.value)} rows={2} className={inputStyles}></textarea>
                             <button onClick={() => removeFAQ(f.id)} className="text-red-500 text-xs float-right p-1">Hapus</button>
                         </div>
                     ))}
                     <button onClick={addFAQ} className="text-sm text-primary hover:text-secondary flex items-center"><PlusIcon /> Tambah Tanya-Jawab</button>
                 </div>
            </div>

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 mt-8 border-t px-4 -mx-4 sm:px-0 sm:mx-0">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div className="self-start sm:self-center">
                    {isPrimaryActionDisabled && product.status !== ProductStatus.DRAFT && (
                        <p className="text-sm text-red-600">Harap lengkapi nama, foto, dan harga untuk mempublikasikan.</p>
                    )}
                 </div>
                 <div className="flex items-center space-x-4 w-full sm:w-auto">
                     <button onClick={() => handleSave(ProductStatus.DRAFT)} className="flex-1 sm:flex-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
                         Simpan Draft
                     </button>
                      <button 
                        onClick={() => setIsPreviewing(true)}
                        disabled={isPrimaryActionDisabled}
                        className="flex-1 sm:flex-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                         <EyeIcon />
                         <span>Pratinau</span>
                     </button>
                     <button 
                        onClick={handlePrimaryAction}
                        disabled={isPrimaryActionDisabled}
                        className="flex-1 sm:flex-auto px-6 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-primary disabled:bg-gray-500 disabled:cursor-not-allowed">
                         {product.status === ProductStatus.DRAFT ? 'Publikasikan' : 'Perbarui'}
                     </button>
                 </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default ProductEditView;