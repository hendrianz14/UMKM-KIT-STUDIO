'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatCurrency } from '@/lib/utils.client';
import { PriceType, Product, StorefrontSettings } from '@/types/storefront.types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Added optional props for Next.js compatibility.
  settings?: StorefrontSettings;
  products?: Product[];
}

const QuoteDrawer: React.FC<QuoteDrawerProps> = ({ isOpen, onClose, settings, products: productsProp }) => {
  // Fix: Prioritize passed props, fallback to context for CRA compatibility.
  const { quoteItems, products: productsContext, removeFromQuote, clearQuote, storefrontSettings: settingsContext } = useStore();
  const products = productsProp || productsContext;
  const storefrontSettings = settings || settingsContext;

  const totalPrice = useMemo(() => {
    return quoteItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;

      let price = 0;
      if (product.priceType === PriceType.SINGLE) {
        price = product.price ?? 0;
      } else {
        const variant = product.variants.combinations.find(v => v.id === item.variantId);
        if (variant && !variant.askOnWA) {
          price = variant.price;
        }
      }
      return total + (price * item.quantity);
    }, 0);
  }, [quoteItems, products]);

  const handleSendQuote = () => {
    if (!storefrontSettings) return;

    const containsServiceItems = quoteItems.some(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return false;
        if (product.priceType === PriceType.SINGLE) {
            return !product.price || product.price <= 0;
        }
        const variant = product.variants.combinations.find(v => v.id === item.variantId);
        return !!variant?.askOnWA;
    });

    const codePrefix = containsServiceItems ? 'TANYA' : 'INV';
    const uniqueCode = `${codePrefix}-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    const title = containsServiceItems ? `*Pertanyaan #${uniqueCode}*` : `*Pesanan #${uniqueCode}*`;
    const intro = containsServiceItems 
      ? `Halo, saya ingin bertanya mengenai produk/layanan berikut dari *${storefrontSettings.name}*:`
      : `Halo, saya tertarik dengan produk berikut dari *${storefrontSettings.name}*:`;

    let message = `${title}\n\n${intro}\n\n`;
    let calculatedTotalPrice = 0;

    quoteItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      let variantText = '';
      let price = 0;

      if (product.priceType === PriceType.SINGLE) {
        price = product.price ?? 0;
      } else {
        const variant = product.variants.combinations.find(v => v.id === item.variantId);
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
      message += `Harga: ${price > 0 ? formatCurrency(itemTotalPrice) : 'Tanya harga'}\n\n`;
    });
    
    if (calculatedTotalPrice > 0) {
      message += `*Subtotal: ${formatCurrency(calculatedTotalPrice)}*\n\n`;
    }

    message += `Mohon informasinya lebih lanjut. Terima kasih.`;

    const whatsappUrl = `https://wa.me/${storefrontSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-[50] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-[60] transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-xl font-semibold text-gray-900">Keranjang</h2>
            <button onClick={onClose}><XIcon /></button>
          </div>
          
          {quoteItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Keranjang Anda kosong.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {quoteItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                
                const variant = product.priceType === PriceType.VARIANT ? product.variants.combinations.find(v => v.id === item.variantId) : null;
                const image = product.images.find(img => img.id === product.coverImageId) || product.images[0];
                const price = variant ? (variant.askOnWA ? 0 : variant.price) : (product.price ?? 0);

                return (
                  <div key={`${item.productId}-${item.variantId || 'simple'}`} className="flex items-start space-x-4">
                    <img src={image?.url} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      {variant && <p className="text-sm text-gray-500">{Object.values(variant.options).join(', ')}</p>}
                      <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                      <p className="font-semibold mt-1 text-gray-800">{price > 0 ? formatCurrency(price * item.quantity) : 'Tanya harga'}</p>
                    </div>
                    <button onClick={() => removeFromQuote(item.productId, item.variantId)} className="text-red-600 hover:text-red-700 p-1 transition-colors"><TrashIcon /></button>
                  </div>
                );
              })}
            </div>
          )}

          {quoteItems.length > 0 && storefrontSettings && (
            <div className="p-4 border-t space-y-4">
              {totalPrice > 0 && (
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-xl text-gray-900">{formatCurrency(totalPrice)}</span>
                </div>
              )}
              <button onClick={handleSendQuote} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <WhatsAppIcon />
                <span>Kirim Pertanyaan via WhatsApp</span>
              </button>
              <button onClick={clearQuote} className="w-full text-red-600 hover:text-red-700 text-sm transition-colors">Kosongkan Keranjang</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuoteDrawer;
