'use client';

import Link from 'next/link';
import { useStorefront } from './StorefrontProvider';
import CartIcon from './icons/CartIcon';

interface StorefrontHeaderProps {
  onQuoteClick: () => void;
}

const StorefrontHeader = ({ onQuoteClick }: StorefrontHeaderProps) => {
  const { storefront, quoteItems } = useStorefront();
  const quoteItemCount = quoteItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href={`/shop/${storefront.slug}`}
          className="text-2xl font-bold text-primary"
        >
          {storefront.name}
        </Link>
        <button
          onClick={onQuoteClick}
          className="relative rounded-lg p-2 transition hover:bg-gray-100"
          aria-label="Buka ringkasan pesanan"
        >
          <CartIcon />
          {quoteItemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
              {quoteItemCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};

export default StorefrontHeader;
