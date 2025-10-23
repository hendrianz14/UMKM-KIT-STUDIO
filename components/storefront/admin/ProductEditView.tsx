'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SafeImage from '../SafeImage';
import PlusIcon from '../icons/PlusIcon';
import StarIcon from '../icons/StarIcon';
import ImagePlusIcon from '../icons/ImagePlusIcon';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import EyeIcon from '../icons/EyeIcon';
import PreviewView from './PreviewView';
import { useStorefront } from '../StorefrontProvider';
import {
  NewProductInput,
  PriceType,
  Product,
  ProductFAQ,
  ProductImage,
  ProductSpec,
  ProductStatus,
  StockStatus,
  VariantCombination,
  VariantGroup,
} from '@/lib/storefront/types';
import { slugify } from '@/lib/storefront/utils';

interface ProductEditViewProps {
  productToEdit: Product | null;
  onBack: () => void;
}

const generateCombinations = (groups: VariantGroup[]): VariantCombination[] => {
  if (groups.length === 0 || groups.some((group) => group.options.length === 0)) {
    return [];
  }

  const combinations: Record<string, string>[] = [];

  const recursion = (index: number, current: Record<string, string>) => {
    if (index === groups.length) {
      combinations.push(current);
      return;
    }
    const group = groups[index];
    for (const option of group.options) {
      recursion(index + 1, { ...current, [group.name]: option });
    }
  };

  recursion(0, {});

  return combinations.map((combo, index) => ({
    id: `combo-${Date.now()}-${index}`,
    options: combo,
    price: 0,
    askOnWA: false,
    stockStatus: StockStatus.AVAILABLE,
  }));
};

const emptyProduct: NewProductInput = {
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

const inputStyles =
  'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary focus:outline-none focus:ring-secondary';

const ProductEditView = ({ productToEdit, onBack }: ProductEditViewProps) => {
  const { addProduct, updateProduct, storefront, products } = useStorefront();
  const [product, setProduct] = useState<
    Product | NewProductInput
  >(productToEdit ?? emptyProduct);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!product.name.trim()) {
      setNameError('');
      return;
    }

    const isDuplicate = products.some((candidate) => {
      if ('id' in product && candidate.id === product.id) {
        return false;
      }
      return (
        candidate.name.trim().toLowerCase() === product.name.trim().toLowerCase()
      );
    });

    setNameError(
      isDuplicate ? 'Nama produk sudah ada. Harap gunakan nama lain.' : '',
    );
  }, [product, products]);

  const canPublish = useMemo(() => {
    if (!product.name.trim() || nameError) return false;
    if (product.images.length === 0) return false;
    if (product.priceType === PriceType.SINGLE) {
      return (product.price ?? 0) > 0;
    }

    if (product.variants.combinations.length === 0) {
      return false;
    }
    const hasInvalid = product.variants.combinations.some(
      (combo) =>
        combo.stockStatus === StockStatus.AVAILABLE &&
        !combo.askOnWA &&
        combo.price <= 0,
    );
    return !hasInvalid;
  }, [product, nameError]);

  const canMakeVisible = useMemo(() => {
    if (!product.name.trim() || nameError) return false;
    return product.images.length > 0;
  }, [product, nameError]);

  const isPrimaryActionDisabled = useMemo(() => {
    const targetStatus = product.status;
    if (targetStatus === ProductStatus.PUBLISHED) {
      return !canPublish;
    }
    if (
      targetStatus === ProductStatus.UNAVAILABLE ||
      targetStatus === ProductStatus.UNLISTED ||
      targetStatus === ProductStatus.PRE_ORDER
    ) {
      return !canMakeVisible;
    }
    return false;
  }, [product.status, canPublish, canMakeVisible]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceTypeChange = (type: PriceType) => {
    setProduct((prev) => ({
      ...prev,
      priceType: type,
      variants:
        type === PriceType.VARIANT ? prev.variants : { groups: [], combinations: [] },
    }));
  };

  const addBadge = (badge: string) => {
    setProduct((prev) => ({
      ...prev,
      badges: Array.from(new Set([...(prev.badges ?? []), badge])),
    }));
  };

  const removeBadge = (badge: string) => {
    setProduct((prev) => ({
      ...prev,
      badges: (prev.badges ?? []).filter((item) => item !== badge),
    }));
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  async function downscaleAndCompress(file: File, maxDim = 1600, quality = 0.8): Promise<string> {
    const img = document.createElement('img');
    const blobUrl = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = blobUrl;
      });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      } else if (width === height && width > maxDim) {
        width = maxDim;
        height = maxDim;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      // export as JPEG with quality
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      return dataUrl;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const userId = storefront.ownerUserId || 'guest';

    const results: ProductImage[] = [];
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await downscaleAndCompress(file, 1600, 0.82);
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, userId }),
        });
        if (!res.ok) throw new Error('Upload failed');
        const payload = await res.json();
        results.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: payload.publicUrl as string,
          altText: file.name,
        });
      } catch (e) {
        // fallback to local preview if upload fails (optional): skip adding
        // console.error('Image upload failed', e);
      }
    }

    if (results.length > 0) {
      setProduct((prev) => {
        const nextImages = [...prev.images, ...results];
        return {
          ...prev,
          images: nextImages,
          coverImageId: prev.coverImageId ?? nextImages[0]?.id,
        };
      });
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setProduct((prev) => {
      const nextImages = prev.images.filter((image) => image.id !== imageId);
      const nextCover =
        prev.coverImageId === imageId ? nextImages[0]?.id : prev.coverImageId;
      return {
        ...prev,
        images: nextImages,
        coverImageId: nextCover,
      };
    });
  };

  const handleSetCover = (imageId: string) => {
    setProduct((prev) => ({
      ...prev,
      coverImageId: imageId,
    }));
  };

  const updateVariantGroup = (groupId: string, key: keyof VariantGroup, value: string) => {
    setProduct((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        groups: prev.variants.groups.map((group) =>
          group.id === groupId ? { ...group, [key]: value } : group,
        ),
      },
    }));
  };

  const removeVariantGroup = (groupId: string) => {
    setProduct((prev) => {
      const groups = prev.variants.groups.filter((group) => group.id !== groupId);
      const combinations = prev.variants.combinations.filter((combination) =>
        Object.keys(combination.options).every((key) =>
          groups.some((group) => group.name === key),
        ),
      );

      return {
        ...prev,
        variants: {
          groups,
          combinations,
        },
      };
    });
  };

  const addVariantGroup = () => {
    setProduct((prev) => ({
      ...prev,
      variants: {
        groups: [
          ...prev.variants.groups,
          {
            id: `vg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: `Opsi ${prev.variants.groups.length + 1}`,
            options: [],
          },
        ],
        combinations: prev.variants.combinations,
      },
    }));
  };

  const addVariantOption = (groupId: string, option: string) => {
    if (!option.trim()) return;
    setProduct((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        groups: prev.variants.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                options: Array.from(new Set([...group.options, option.trim()])),
              }
            : group,
        ),
      },
    }));
  };

  const removeVariantOption = (groupId: string, option: string) => {
    setProduct((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        groups: prev.variants.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                options: group.options.filter((item) => item !== option),
              }
            : group,
        ),
      },
    }));
  };

  const regenerateCombinations = () => {
    setProduct((prev) => ({
      ...prev,
      variants: {
        groups: prev.variants.groups,
        combinations: generateCombinations(prev.variants.groups),
      },
    }));
  };

  const updateCombination = (
    combinationId: string,
    key: keyof VariantCombination,
    value: string | number | boolean | StockStatus,
  ) => {
    setProduct((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        combinations: prev.variants.combinations.map((combination) =>
          combination.id === combinationId
            ? { ...combination, [key]: value }
            : combination,
        ),
      },
    }));
  };

  const addSpec = () => {
    setProduct((prev) => ({
      ...prev,
      specs: [
        ...prev.specs,
        {
          id: `spec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: '',
          items: [],
        },
      ],
    }));
  };

  const updateSpec = (specId: string, key: keyof ProductSpec, value: string) => {
    setProduct((prev) => ({
      ...prev,
      specs: prev.specs.map((spec) =>
        spec.id === specId
          ? {
              ...spec,
              [key]: key === 'items' ? value.split(',').map((item) => item.trim()) : value,
            }
          : spec,
      ),
    }));
  };

  const removeSpec = (specId: string) => {
    setProduct((prev) => ({
      ...prev,
      specs: prev.specs.filter((spec) => spec.id !== specId),
    }));
  };

  const addFAQ = () => {
    setProduct((prev) => ({
      ...prev,
      faq: [
        ...prev.faq,
        {
          id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          question: '',
          answer: '',
        },
      ],
    }));
  };

  const updateFAQ = (faqId: string, key: keyof ProductFAQ, value: string) => {
    setProduct((prev) => ({
      ...prev,
      faq: prev.faq.map((faq) =>
        faq.id === faqId ? { ...faq, [key]: value } : faq,
      ),
    }));
  };

  const removeFAQ = (faqId: string) => {
    setProduct((prev) => ({
      ...prev,
      faq: prev.faq.filter((faq) => faq.id !== faqId),
    }));
  };

  const handleSave = async (status: ProductStatus) => {
    const base = { ...product, status };

    if ('id' in base) {
      await updateProduct({
        ...base,
        updatedAt: new Date().toISOString(),
      });
      onBack();
      return;
    }

    const payload: NewProductInput = {
      ...base,
      coverImageId: base.coverImageId,
    };
    await addProduct(payload);
    onBack();
  };

  const handlePrimaryAction = () => {
    void handleSave(product.status);
  };

  const handlePreview = () => {
    setIsPreviewing(true);
  };

  const handleClosePreview = () => {
    setIsPreviewing(false);
  };

  const handleGenerateSlug = () => {
    setProduct((prev) => ({
      ...prev,
      slug: slugify(prev.name),
    }));
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          &larr; Kembali
        </button>
        <div className="text-sm text-gray-500">
          {storefront.slug ? (
            <a
              href={`/shop/${storefront.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLinkIcon /> Lihat toko
            </a>
          ) : (
            'Slug toko belum diatur'
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informasi Produk
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Masukkan nama produk"
                  required
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-600">{nameError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <input
                  type="text"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Contoh: Fashion, Makanan, Jasa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="shortDescription"
                  value={product.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className={inputStyles}
                  placeholder="Deskripsi singkat produk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi Lengkap
                </label>
                <textarea
                  name="longDescription"
                  value={product.longDescription}
                  onChange={handleChange}
                  rows={5}
                  className={inputStyles}
                  placeholder="Jelaskan produk Anda secara lebih detail"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Galeri Produk</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan beberapa foto untuk menampilkan produk Anda dari berbagai sudut.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className={`group relative overflow-hidden rounded-lg border ${product.coverImageId === image.id ? 'border-secondary ring-2 ring-secondary' : 'border-gray-200'}`}
                >
                  <SafeImage
                    src={image.url}
                    alt={image.altText || product.name}
                    width={320}
                    height={320}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className="rounded bg-white px-2 py-1 text-xs font-semibold"
                    >
                      Jadikan Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                    >
                      Hapus
                    </button>
                  </div>
                  {product.coverImageId === image.id && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-white">
                      <StarIcon /> Cover
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImage}
                className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 transition hover:border-secondary hover:text-secondary"
              >
                <ImagePlusIcon />
                <span className="mt-2">Tambah Foto</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Harga & Status</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status Produk
                </label>
                <select
                  name="status"
                  value={product.status}
                  onChange={(event) =>
                    setProduct((prev) => ({
                      ...prev,
                      status: event.target.value as ProductStatus,
                    }))
                  }
                  className={inputStyles}
                >
                  <option value={ProductStatus.DRAFT}>Draft</option>
                  <option value={ProductStatus.PUBLISHED}>Published</option>
                  <option value={ProductStatus.UNLISTED}>Unlisted</option>
                  <option value={ProductStatus.UNAVAILABLE}>Tidak Tersedia</option>
                  <option value={ProductStatus.PRE_ORDER}>Pre-Order</option>
                </select>
              </div>
              {product.status === ProductStatus.PRE_ORDER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimasi Pre-Order
                  </label>
                  <input
                    type="text"
                    name="preOrderEstimate"
                    value={product.preOrderEstimate ?? ''}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Contoh: 14 hari kerja"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className="block text-sm font-medium text-gray-700">
                Tipe Harga
              </span>
              <div className="mt-2 inline-flex rounded-lg border bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handlePriceTypeChange(PriceType.SINGLE)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    product.priceType === PriceType.SINGLE
                      ? 'bg-white text-secondary shadow'
                      : 'text-gray-600'
                  }`}
                >
                  Harga Tunggal
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceTypeChange(PriceType.VARIANT)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    product.priceType === PriceType.VARIANT
                      ? 'bg-white text-secondary shadow'
                      : 'text-gray-600'
                  }`}
                >
                  Berdasarkan Varian
                </button>
              </div>
            </div>

            {product.priceType === PriceType.SINGLE ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Harga
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={product.price ?? 0}
                    min={0}
                    onChange={(event) =>
                      setProduct((prev) => ({
                        ...prev,
                        price: Number(event.target.value),
                      }))
                    }
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Harga Coret (Opsional)
                  </label>
                  <input
                    type="number"
                    name="strikethroughPrice"
                    value={product.strikethroughPrice ?? ''}
                    min={0}
                    onChange={(event) =>
                      setProduct((prev) => ({
                        ...prev,
                        strikethroughPrice: Number(event.target.value) || undefined,
                      }))
                    }
                    className={inputStyles}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-800">
                      Variasi Produk
                    </h3>
                    <button
                      type="button"
                      onClick={addVariantGroup}
                      className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary"
                    >
                      <PlusIcon /> Tambah Variasi
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Buat variasi seperti Ukuran, Warna, atau Paket.
                  </p>

                  <div className="mt-4 space-y-4">
                    {product.variants.groups.map((group) => (
                      <div key={group.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(event) =>
                              updateVariantGroup(group.id, 'name', event.target.value)
                            }
                            className={`${inputStyles} font-semibold`}
                            placeholder="Nama variasi (contoh: Ukuran)"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantGroup(group.id)}
                            className="text-sm text-red-500 transition hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {group.options.map((option) => (
                              <span
                                key={option}
                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
                              >
                                {option}
                                <button
                                  type="button"
                                  onClick={() => removeVariantOption(group.id, option)}
                                  className="ml-2 text-xs text-red-500"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              placeholder="Tambah opsi (Enter untuk simpan)"
                              className={inputStyles}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addVariantOption(group.id, event.currentTarget.value);
                                  event.currentTarget.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input =
                                  (document.querySelector(
                                    `input[name="variant-${group.id}"]`,
                                  ) as HTMLInputElement) ?? null;
                                if (input && input.value.trim()) {
                                  addVariantOption(group.id, input.value);
                                  input.value = '';
                                }
                              }}
                              className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary"
                            >
                              Tambah
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {product.variants.groups.length > 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={regenerateCombinations}
                        className="rounded-md border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Regenerasi Kombinasi
                      </button>
                    </div>
                  )}
                </div>

                {product.variants.groups.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">
                      Daftar Kombinasi
                    </h3>
                    {product.variants.combinations.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">
                        Kombinasi belum dibuat. Klik &quot;Regenerasi Kombinasi&quot;.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">
                                Variasi
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">
                                Harga
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">
                                Tanya di WA
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">
                                Stok
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {product.variants.combinations.map((combo) => (
                              <tr key={combo.id}>
                                <td className="px-4 py-2 text-gray-700">
                                  {Object.values(combo.options).join(', ')}
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    min={0}
                                    value={combo.price}
                                    onChange={(event) =>
                                      updateCombination(
                                        combo.id,
                                        'price',
                                        Number(event.target.value),
                                      )
                                    }
                                    className={`${inputStyles} w-32`}
                                    disabled={combo.askOnWA}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={combo.askOnWA}
                                    onChange={(event) =>
                                      updateCombination(combo.id, 'askOnWA', event.target.checked)
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <select
                                    value={combo.stockStatus}
                                    onChange={(event) =>
                                      updateCombination(
                                        combo.id,
                                        'stockStatus',
                                        event.target.value as StockStatus,
                                      )
                                    }
                                    className={inputStyles}
                                  >
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
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Spesifikasi Produk</h2>
            <div className="mt-4 space-y-4">
              {product.specs.map((spec) => (
                <div key={spec.id} className="space-y-2 rounded border p-3">
                  <input
                    type="text"
                    value={spec.title}
                    onChange={(event) => updateSpec(spec.id, 'title', event.target.value)}
                    className={`${inputStyles} font-semibold`}
                    placeholder="Judul (contoh: Material)"
                  />
                  <textarea
                    value={spec.items.join(', ')}
                    onChange={(event) => updateSpec(spec.id, 'items', event.target.value)}
                    rows={2}
                    className={inputStyles}
                    placeholder="Item, pisahkan dengan koma"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(spec.id)}
                    className="text-xs text-red-500 transition hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
              >
                <PlusIcon /> Tambah Spesifikasi
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">FAQ Produk</h2>
            <div className="mt-4 space-y-4">
              {product.faq.map((faq) => (
                <div key={faq.id} className="space-y-2 rounded border p-3">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(event) => updateFAQ(faq.id, 'question', event.target.value)}
                    className={`${inputStyles} font-semibold`}
                    placeholder="Pertanyaan"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(event) => updateFAQ(faq.id, 'answer', event.target.value)}
                    rows={2}
                    className={inputStyles}
                    placeholder="Jawaban"
                  />
                  <button
                    type="button"
                    onClick={() => removeFAQ(faq.id)}
                    className="text-xs text-red-500 transition hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFAQ}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
              >
                <PlusIcon /> Tambah Tanya-Jawab
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Label & Badge</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan label untuk menonjolkan produk (contoh: Terlaris, Diskon).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.badges ?? []).map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => removeBadge(badge)}
                    className="ml-2 text-xs text-primary/80"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Tambah badge..."
                className={inputStyles}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (event.currentTarget.value.trim()) {
                      addBadge(event.currentTarget.value.trim());
                      event.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(
                    'badge-input',
                  ) as HTMLInputElement | null;
                  if (input && input.value.trim()) {
                    addBadge(input.value.trim());
                    input.value = '';
                  }
                }}
                className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary"
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Slug Produk</h2>
            <p className="mt-1 text-sm text-gray-500">
              Slug digunakan di URL publik. Klik tombol untuk menghasilkan otomatis.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={'slug' in product ? product.slug : slugify(product.name)}
                onChange={(event) =>
                  setProduct((prev) => ({
                    ...prev,
                    slug: event.target.value,
                  }))
                }
                className={inputStyles}
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="rounded-md border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Pratinjau Cepat</h2>
            <p className="mt-1 text-sm text-gray-500">
              Lihat bagaimana produk muncul pada halaman publik.
            </p>
            <button
              type="button"
              onClick={handlePreview}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <EyeIcon />
              <span>Pratinjau Produk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-4 bg-white/90 px-4 py-4 backdrop-blur-sm sm:mx-0 sm:rounded-t-lg sm:px-0">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isPrimaryActionDisabled && product.status !== ProductStatus.DRAFT && (
              <p className="text-sm text-red-600">
                Lengkapi nama, foto, dan harga sebelum mempublikasikan.
              </p>
            )}
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => void handleSave(ProductStatus.DRAFT)}
              className="flex-1 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex-none"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex-none"
            >
              <span>Pratinjau</span>
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPrimaryActionDisabled}
              className="flex-1 rounded-md bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-gray-400 sm:flex-none"
            >
              {product.status === ProductStatus.DRAFT ? 'Publikasikan' : 'Perbarui'}
            </button>
          </div>
        </div>
      </div>

      {isPreviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="h-full w-full overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:h-auto sm:max-w-5xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClosePreview}
                className="text-sm font-semibold text-primary transition hover:text-secondary"
              >
                Tutup Preview
              </button>
            </div>
            <PreviewView
              product={
                'id' in product
                  ? product
                  : {
                      ...product,
                      id: 'temp-id',
                      slug: slugify(product.name || 'produk'),
                      updatedAt: new Date().toISOString(),
                    }
              }
              onBackToEdit={handleClosePreview}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductEditView;
