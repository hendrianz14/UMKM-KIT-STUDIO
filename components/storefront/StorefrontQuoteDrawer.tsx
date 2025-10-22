'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useStorefront } from './StorefrontProvider';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { formatCurrency } from '@/lib/storefront/utils';
import { PriceType } from '@/lib/storefront/types';

interface StorefrontQuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const StorefrontQuoteDrawer = ({
  isOpen,
  onClose,
}: StorefrontQuoteDrawerProps) => {
  const {
    storefront,
    products,
    quoteItems,
    removeFromQuote,
    clearQuote,
  } = useStorefront();

  const totalPrice = useMemo(() => {
    return quoteItems.reduce((total, item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return total;

      let price = 0;
      if (product.priceType === PriceType.SINGLE) {
        price = product.price ?? 0;
      } else {
        const variant = product.variants.combinations.find(
          (candidate) => candidate.id === item.variantId,
        );
        if (variant && !variant.askOnWA) {
          price = variant.price;
        }
      }

      return total + price * item.quantity;
    }, 0);
  }, [products, quoteItems]);

  const handleSendQuote = () => {
    if (!storefront) return;

    const containsServiceItems = quoteItems.some((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return false;

      if (product.priceType === PriceType.SINGLE) {
        return !product.price || product.price <= 0;
      }

      const variant = product.variants.combinations.find(
        (candidate) => candidate.id === item.variantId,
      );
      return Boolean(variant?.askOnWA);
    });

    const codePrefix = containsServiceItems ? 'TANYA' : 'INV';
    const uniqueCode = `${codePrefix}-${Date.now()
      .toString()
      .slice(-5)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const title = containsServiceItems
      ? `*Pertanyaan #${uniqueCode}*`
      : `*Pesanan #${uniqueCode}*`;
    const intro = containsServiceItems
      ? `Halo, saya ingin bertanya mengenai produk/layanan berikut dari *${storefront.name}*:`
      : `Halo, saya tertarik dengan produk berikut dari *${storefront.name}*:`;

    let message = `${title}\n\n${intro}\n\n`;
    let calculatedTotalPrice = 0;

    quoteItems.forEach((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return;

      let variantText = '';
      let price = 0;

      if (product.priceType === PriceType.SINGLE) {
        price = product.price ?? 0;
      } else {
        const variant = product.variants.combinations.find(
          (candidate) => candidate.id === item.variantId,
        );
        if (variant) {
          variantText = ` (${Object.values(variant.options).join(', ')})`;
          price = variant.askOnWA ? 0 : variant.price;
        }
      }

      const itemTotalPrice = price * item.quantity;
      calculatedTotalPrice += itemTotalPrice;

      message += `*${product.name}*${variantText}\n`;
      message += `Jumlah: ${item.quantity}\n`;
      if (item.notes) {
        message += `Catatan: ${item.notes}\n`;
      }
      message += `Harga: ${
        price > 0 ? formatCurrency(itemTotalPrice) : 'Tanya harga'
      }\n\n`;
    });

    if (calculatedTotalPrice > 0) {
      message += `*Subtotal: ${formatCurrency(calculatedTotalPrice)}*\n\n`;
    }

    message += `Mohon informasinya lebih lanjut. Terima kasih.`;

    const whatsappUrl = `https://wa.me/${storefront.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[50] bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-[60] h-full w-full transform bg-white shadow-xl transition-transform sm:max-w-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold text-gray-900">Ringkasan</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-600 transition hover:bg-gray-100"
              aria-label="Tutup ringkasan"
            >
              <XIcon />
            </button>
          </div>

          {quoteItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">Ringkasan Anda kosong.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {quoteItems.map((item) => {
                const product = products.find(
                  (candidate) => candidate.id === item.productId,
                );
                if (!product) return null;

                const variant =
                  product.priceType === PriceType.VARIANT
                    ? product.variants.combinations.find(
                        (candidate) => candidate.id === item.variantId,
                      )
                    : null;
                const image =
                  product.images.find((img) => img.id === product.coverImageId) ||
                  product.images[0];
                const price =
                  variant?.askOnWA === true
                    ? 0
                    : variant
                      ? variant.price
                      : product.price ?? 0;

                return (
                  <div
                    key={`${item.productId}-${item.variantId ?? 'simple'}`}
                    className="flex items-start space-x-4"
                  >
                    {image ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-md">
                        <Image
                          src={image.url}
                          alt={image.altText || product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
                        Tidak ada foto
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      {variant && (
                        <p className="text-sm text-gray-500">
                          {Object.values(variant.options).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Jumlah: {item.quantity}
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {price > 0
                          ? formatCurrency(price * item.quantity)
                          : 'Tanya harga'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromQuote(item.productId, item.variantId)}
                      className="rounded-full p-1 text-red-600 transition hover:bg-red-50"
                      aria-label="Hapus item"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {quoteItems.length > 0 && (
            <div className="space-y-4 border-t p-4">
              {totalPrice > 0 && (
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-xl text-gray-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              )}
              <button
                onClick={handleSendQuote}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-700 py-3 px-4 font-bold text-white transition hover:bg-green-800"
              >
                <WhatsAppIcon />
                <span>Kirim via WhatsApp</span>
              </button>
              <button
                onClick={clearQuote}
                className="w-full text-sm text-red-600 transition hover:text-red-700"
              >
                Kosongkan Ringkasan
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StorefrontQuoteDrawer;
