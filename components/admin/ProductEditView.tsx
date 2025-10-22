'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { StorefrontProduct, StorefrontProductInput } from '@/types/storefront.types';

interface ProductEditViewProps {
  product: StorefrontProduct | null;
  isSaving: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (payload: StorefrontProductInput, productId?: string) => Promise<void>;
}

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Archived', label: 'Archived' },
];

const typeOptions = [
  { value: 'fixed', label: 'Harga Tetap' },
  { value: 'variable', label: 'Harga Variasi' },
  { value: 'custom', label: 'Harga Custom' },
];

const ProductEditView: React.FC<ProductEditViewProps> = ({
  product,
  isSaving,
  errorMessage,
  onCancel,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [type, setType] = useState<'fixed' | 'variable' | 'custom'>('fixed');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [imageUrls, setImageUrls] = useState('');

  useEffect(() => {
    if (!product) {
      setName('');
      setSlug('');
      setPrice('');
      setStatus('Draft');
      setType('fixed');
      setCategory('');
      setShortDescription('');
      setLongDescription('');
      setHighlights('');
      setImageUrls('');
      return;
    }

    setName(product.name);
    setSlug(product.slug);
    setPrice(typeof product.price === 'number' ? product.price : '');
    setStatus((product.status as 'Draft' | 'Published' | 'Archived') ?? 'Draft');
    setType((product.type as 'fixed' | 'variable' | 'custom') ?? 'fixed');
    setCategory(product.category ?? '');
    setShortDescription(product.shortDescription ?? '');
    setLongDescription(product.longDescription ?? '');
    setHighlights(product.badges.join('\n'));
    setImageUrls(product.images.map((image) => image.url).join('\n'));
  }, [product]);

  const isEdit = Boolean(product);

  const canSubmit = useMemo(() => {
    return Boolean(name.trim()) && !isSaving;
  }, [name, isSaving]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const numericPrice = typeof price === 'number' ? price : Number(price || 0);

    const payload: StorefrontProductInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      price: Number.isNaN(numericPrice) ? null : numericPrice,
      status,
      type,
      category: category.trim() || null,
      shortDescription: shortDescription.trim() || null,
      longDescription: longDescription.trim() || null,
      highlights: highlights
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      images: imageUrls
        .split(/\r?\n/)
        .map((url, index) => url.trim())
        .filter(Boolean)
        .map((url, index) => ({
          url,
          sortOrder: index,
        })),
    };

    await onSubmit(payload, product?.id);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-lg font-semibold text-primary">{isEdit ? 'Edit Produk' : 'Produk Baru'}</h3>
        <p className="text-sm text-blue-400">
          Sesuaikan detail produk Anda. Sorotan, deskripsi, dan gambar akan langsung muncul pada katalog publik.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary" htmlFor="product-name">
          Nama Produk *
        </label>
        <input
          id="product-name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Contoh: Paket Hampers Lebaran Premium"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-slug">
            Slug URL
          </label>
          <input
            id="product-slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="paket-hampers-lebaran"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-category">
            Kategori
          </label>
          <input
            id="product-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Kategori produk"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-price">
            Harga
          </label>
          <input
            id="product-price"
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value === '' ? '' : Number(event.target.value))}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="150000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-type">
            Jenis Produk
          </label>
          <select
            id="product-type"
            value={type}
            onChange={(event) => setType(event.target.value as 'fixed' | 'variable' | 'custom')}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-status">
            Status
          </label>
          <select
            id="product-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as 'Draft' | 'Published' | 'Archived')}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary" htmlFor="product-short-description">
            Deskripsi Singkat
          </label>
          <textarea
            id="product-short-description"
            rows={3}
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Ceritakan keunggulan utama produk Anda."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary" htmlFor="product-long-description">
          Deskripsi Lengkap
        </label>
        <textarea
          id="product-long-description"
          rows={6}
          value={longDescription}
          onChange={(event) => setLongDescription(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Detail produk, fitur, dan manfaat untuk pelanggan."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary" htmlFor="product-highlights">
          Sorotan (pisahkan per baris)
        </label>
        <textarea
          id="product-highlights"
          rows={4}
          value={highlights}
          onChange={(event) => setHighlights(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder={'✓ Paket lengkap siap kirim\n✓ Bisa custom ucapan\n✓ Estimasi produksi 3 hari'}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary" htmlFor="product-images">
          URL Gambar (pisahkan per baris)
        </label>
        <textarea
          id="product-images"
          rows={4}
          value={imageUrls}
          onChange={(event) => setImageUrls(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder={'https://.../image-1.jpg\nhttps://.../image-2.jpg'}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-blue-200"
        >
          {isSaving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-xl border border-blue-100 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-blue-50/50"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default ProductEditView;
