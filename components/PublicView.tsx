'use client';

import React, { useMemo, useState } from 'react';
import HeaderStorefront from '@/components/HeaderStorefront';
import ProductCardProduct from '@/components/ProductCardProduct';
import QuoteDrawer from '@/components/QuoteDrawer';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import type { StorefrontProduct } from '@/types/storefront.types';

const PublicView: React.FC = () => {
  const { storefront, products } = useStorefrontContext();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);

  const heroContent = useMemo(() => {
    const theme = storefront?.theme ?? {};
    return {
      headline:
        (typeof theme.heroHeadline === 'string' && theme.heroHeadline.trim().length > 0)
          ? theme.heroHeadline
          : 'Tingkatkan penjualan dengan katalog AI KitStudio.',
      subheadline:
        (typeof theme.heroSubheadline === 'string' && theme.heroSubheadline.trim().length > 0)
          ? theme.heroSubheadline
          : 'Solusi praktis bagi UMKM untuk membuat materi promosi yang rapi dan profesional.',
      ctaLabel:
        (typeof theme.heroCtaLabel === 'string' && theme.heroCtaLabel.trim().length > 0)
          ? theme.heroCtaLabel
          : 'Minta Penawaran',
      heroImage:
        (typeof theme.heroImageUrl === 'string' && theme.heroImageUrl.trim().length > 0)
          ? theme.heroImageUrl
          : 'https://dummyimage.com/1200x800/0d47a1/ffffff&text=KitStudio+Storefront',
    };
  }, [storefront]);

  const handleOpenQuote = (product?: StorefrontProduct) => {
    setSelectedProduct(product ?? null);
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-blue-50">
      <HeaderStorefront onQuoteClick={() => handleOpenQuote()} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,71,161,0.25),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-16 text-primary sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary shadow">
              {storefront?.name ?? 'Storefront KitStudio'}
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{heroContent.headline}</h1>
            <p className="max-w-2xl text-lg text-blue-500">{heroContent.subheadline}</p>
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="button"
                onClick={() => handleOpenQuote()}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                {heroContent.ctaLabel}
              </button>
              <a
                href="#catalog"
                className="rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Lihat Katalog
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="overflow-hidden rounded-[32px] border border-primary/20 bg-white/80 shadow-xl">
              <img src={heroContent.heroImage} alt="Storefront hero" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="highlights" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-primary/70">Konten Otomatis</p>
            <h3 className="mt-3 text-lg font-semibold text-primary">Desain siap upload</h3>
            <p className="mt-2 text-sm text-blue-500">
              Semua template konten dan katalog dibuat dari satu dashboard, tinggal bagikan ke sosial media Anda.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-primary/70">Terintegrasi AI</p>
            <h3 className="mt-3 text-lg font-semibold text-primary">Promo lebih cepat</h3>
            <p className="mt-2 text-sm text-blue-500">
              Gunakan fitur generate caption, katalog, dan WhatsApp replies untuk melipatgandakan produktivitas tim.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-primary/70">Kolaboratif</p>
            <h3 className="mt-3 text-lg font-semibold text-primary">Build bersama tim</h3>
            <p className="mt-2 text-sm text-blue-500">
              Simpan permintaan penawaran pelanggan dan kelola akun tim marketing Anda langsung dari dashboard.
            </p>
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-primary">Katalog Produk</h2>
            <p className="text-sm text-blue-500">
              Temukan solusi terbaik untuk meningkatkan kualitas konten dan pemasaran UMKM Anda.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-primary shadow">
            {products.length} produk tersedia
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-white/70 p-10 text-center text-sm text-blue-500">
            Produk akan segera hadir. Hubungi kami untuk katalog khusus sesuai kebutuhan Anda.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCardProduct
                key={product.id}
                product={product}
                onQuoteClick={(selected) => handleOpenQuote(selected)}
              />
            ))}
          </div>
        )}
      </section>

      <QuoteDrawer isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} product={selectedProduct ?? undefined} />
    </div>
  );
};

export default PublicView;
