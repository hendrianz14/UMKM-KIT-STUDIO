'use client';

import React, { useState } from 'react';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import type { StorefrontProduct } from '@/types/storefront.types';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product?: StorefrontProduct | null;
}

const QuoteDrawer: React.FC<QuoteDrawerProps> = ({ isOpen, onClose, product }) => {
  const { submitQuote } = useStorefrontContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await submitQuote({
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        productId: product?.id ?? null,
      });
      setStatusMessage('Permintaan penawaran berhasil dikirim. Kami akan segera menghubungi Anda!');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal mengirim permintaan penawaran.';
      setStatusMessage(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-2xl transition duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-blue-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-primary">Minta Penawaran</h3>
            <p className="text-xs text-blue-400">
              {product ? `Produk: ${product.name}` : 'Tinggalkan pesan dan tim kami akan menghubungi Anda.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-blue-100 p-2 text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(100%-72px)] flex-col gap-4 overflow-y-auto px-6 py-6">
          {statusMessage ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-primary">
              {statusMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary" htmlFor="quote-name">
              Nama Lengkap *
            </label>
            <input
              id="quote-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Nama Anda"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary" htmlFor="quote-email">
                Email
              </label>
              <input
                id="quote-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="email@domain.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary" htmlFor="quote-phone">
                Nomor WhatsApp
              </label>
              <input
                id="quote-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary" htmlFor="quote-message">
              Pesan
            </label>
            <textarea
              id="quote-message"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ceritakan kebutuhan atau jumlah pesanan Anda."
            />
          </div>

          <div className="mt-auto flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-blue-200"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-blue-100 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-blue-50/40"
            >
              Tutup
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default QuoteDrawer;

