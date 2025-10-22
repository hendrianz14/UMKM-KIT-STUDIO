'use client';

import React from 'react';
import Link from 'next/link';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import { buildWhatsAppLink } from '@/lib/utils.client';

interface HeaderStorefrontProps {
  onQuoteClick?: () => void;
}

const HeaderStorefront: React.FC<HeaderStorefrontProps> = ({ onQuoteClick }) => {
  const { storefront } = useStorefrontContext();

  const whatsappLink = storefront?.whatsappNumber
    ? buildWhatsAppLink(
        storefront.whatsappNumber,
        `Halo ${storefront.name}, saya tertarik dengan katalog Anda.`,
      )
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/20 bg-gradient-to-r from-primary/95 to-secondary/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-white sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Storefront KitStudio</p>
          <h1 className="text-xl font-semibold">{storefront?.name ?? 'KitStudio Storefront'}</h1>
        </div>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link href="#catalog" className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20">
            Katalog
          </Link>
          <Link href="#highlights" className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20">
            Keunggulan
          </Link>
          {onQuoteClick ? (
            <button
              type="button"
              onClick={onQuoteClick}
              className="rounded-full bg-white px-5 py-2 text-primary transition hover:bg-accent hover:text-primary"
            >
              Minta Penawaran
            </button>
          ) : null}
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full border border-white/60 px-4 py-2 text-white/90 transition hover:bg-white/10 sm:inline-flex"
            >
              Chat WhatsApp
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export default HeaderStorefront;
