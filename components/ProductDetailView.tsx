'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import ProductHeader from '@/components/ProductHeader';
import QuoteDrawer from '@/components/QuoteDrawer';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import { buildWhatsAppLink } from '@/lib/utils.client';

const ProductDetailView: React.FC = () => {
  const { storefront, products, activeProductId, setActiveProductId } = useStorefrontContext();
  const product = activeProductId
    ? products.find((item) => item.id === activeProductId) ?? products[0]
    : products[0];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-primary">Produk tidak ditemukan</h2>
        <p className="mt-2 text-sm text-blue-400">
          Produk yang Anda cari mungkin sudah tidak tersedia. Kembali ke{' '}
          <Link href={`/shop/${storefront?.slug ?? ''}`} className="font-semibold text-primary">
            halaman utama toko
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleQuote = () => {
    setIsDrawerOpen(true);
  };

  const whatsappLink = storefront?.whatsappNumber
    ? buildWhatsAppLink(
        storefront.whatsappNumber,
        `Halo ${storefront.name}, saya tertarik dengan produk ${product.name}.`,
      )
    : null;

  return (
    <div className="bg-light py-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-6 lg:px-8">
        <div className="space-y-6">
          <ProductHeader product={product} onQuoteClick={handleQuote} />
          <ImageGallery images={product.images} fallbackAlt={product.name} />
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">Sorotan Produk</h3>
            <ul className="mt-4 space-y-2 text-sm text-blue-500">
              {product.badges.length > 0 ? (
                product.badges.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>Tambahkan highlight produk untuk meyakinkan pelanggan.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary">Deskripsi Produk</h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-500">
              {product.longDescription ?? product.shortDescription ?? 'Belum ada deskripsi panjang.'}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">Hubungi Kami</h3>
            <p className="mt-2 text-sm text-blue-400">
              Siap membantu kebutuhan konten dan pemasaran Anda. Hubungi kami melalui kanal berikut.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
                >
                  Chat via WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">Produk Lainnya</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {products
                .filter((item) => item.id !== product.id)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveProductId(item.id)}
                    className="rounded-full border border-blue-100 px-3 py-1 text-sm text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                  >
                    {item.name}
                  </button>
                ))}
              {products.length <= 1 ? (
                <p className="text-sm text-blue-400">
                  Tambahkan produk lain untuk memperkaya katalog Anda.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <QuoteDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} product={product} />
    </div>
  );
};

export default ProductDetailView;
