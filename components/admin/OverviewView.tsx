'use client';

import React from 'react';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import { formatCurrency } from '@/lib/utils.client';

const OverviewView: React.FC = () => {
  const { storefront, products, quotes } = useStorefrontContext();

  const publishedProducts = products.filter((product) => product.status?.toLowerCase() === 'published');
  const draftProducts = products.filter((product) => product.status?.toLowerCase() !== 'published');
  const totalInventoryValue = products.reduce((acc, product) => acc + (product.price ?? 0), 0);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Produk Terbit</p>
          <p className="mt-3 text-3xl font-bold text-primary">{publishedProducts.length}</p>
          <p className="mt-2 text-sm text-blue-400">
            Produk aktif yang sudah siap tampil di storefront publik.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Draft / Perlu Review</p>
          <p className="mt-3 text-3xl font-bold text-primary">{draftProducts.length}</p>
          <p className="mt-2 text-sm text-blue-400">
            Selesaikan konten dan publish agar muncul di katalog Anda.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Estimasi Nilai Katalog</p>
          <p className="mt-3 text-3xl font-bold text-primary">{formatCurrency(totalInventoryValue)}</p>
          <p className="mt-2 text-sm text-blue-400">
            Jumlah harga produk saat ini dalam katalog Anda.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-blue-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Permintaan Penawaran</h2>
            <p className="text-sm text-blue-400">Kumpulkan prospek yang masuk dari storefront publik.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
            {quotes.length} penawaran
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {quotes.length === 0 ? (
            <p className="text-sm text-blue-400">
              Belum ada penawaran baru. Bagikan tautan{' '}
              <span className="font-semibold text-primary">kitstudio.shop/{storefront?.slug ?? 'toko-anda'}</span>{' '}
              ke pelanggan Anda.
            </p>
          ) : (
            <ul className="space-y-3">
              {quotes.slice(0, 5).map((quote) => (
                <li
                  key={quote.id}
                  className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-primary shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{quote.name}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-primary">
                      {quote.status === 'new' ? 'Baru' : quote.status}
                    </span>
                  </div>
                  {quote.message ? <p className="mt-2 text-blue-500 line-clamp-2">{quote.message}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-blue-400">
                    {quote.email ? <span>Email: {quote.email}</span> : null}
                    {quote.phone ? <span>Telp: {quote.phone}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default OverviewView;
