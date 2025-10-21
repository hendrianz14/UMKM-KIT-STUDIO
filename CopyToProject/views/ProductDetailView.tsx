'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuote } from '@/context/QuoteContext';
import { formatCurrency, convertNewlinesToParagraphs } from '@/lib/utils';
import { Product, VariantCombination, StockStatus, PriceType, ProductStatus, VariantGroup, StorefrontSettings } from '@/types';
import Accordion from '@/components/Accordion';
import Toast from '@/components/Toast';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import ImageGallery from '@/components/ImageGallery';
import QuantityStepper from '@/components/QuantityStepper';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { CartIcon } from '@/components/icons/CartIcon';
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon';
import Link from 'next/link';

interface ProductDetailViewProps {
  product: Product;
  storefrontSettings: StorefrontSettings;
  allProducts: Product[]; // Diperlukan untuk konteks di beberapa komponen anak
  // Fix: Added storeSlug and productSlug to props.
  storeSlug: string;
  productSlug: string;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, storefrontSettings, storeSlug }) => {
  const { addToQuote } = useQuote();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (product?.priceType !== PriceType.VARIANT) return {};
    const initialOptions: Record<string, string> = {};
    product.variants.groups.forEach(group => {
        const firstAvailableOption = group.options.find(option => {
             const tempSelection = { ...initialOptions, [group.name]: option };
             return product.variants.combinations.some(c => 
                Object.keys(tempSelection).every(key => c.options[key] === tempSelection[key]) && c.stockStatus === StockStatus.AVAILABLE
             );
        });
        if(firstAvailableOption) {
            initialOptions[group.name] = firstAvailableOption;
        }
    });
    return initialOptions;
  });

  const selectedVariant = useMemo<VariantCombination | null>(() => {
    if (!product || product.priceType !== PriceType.VARIANT) return null;
    if (Object.keys(selectedOptions).length < product.variants.groups.length) return null;
    
    return product.variants.combinations.find(c => 
      Object.entries(selectedOptions).every(([key, value]) => c.options[key] === value)
    ) || null;
  }, [product, selectedOptions]);

  const handleVariantSelect = (groupName: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupName]: option }));
  };
  
  const isUnavailable = product.status === ProductStatus.UNAVAILABLE;
  const isPreOrder = product.status === ProductStatus.PRE_ORDER;

  const handleAddToQuote = () => {
    if (isActionDisabled || isUnavailable) return;
    addToQuote({
      productId: product.id,
      variantId: product.priceType === PriceType.VARIANT ? selectedVariant?.id : undefined,
      quantity,
      notes: '',
    });
    setShowToast(true);
  };
  
  const priceInfo = useMemo(() => {
    if (product.priceType === PriceType.SINGLE) {
        return { 
            displayPrice: product.price && product.price > 0 ? formatCurrency(product.price) : 'Tanya di WA',
            strikethroughPrice: product.strikethroughPrice ? formatCurrency(product.strikethroughPrice) : undefined,
            isAskOnWA: !(product.price && product.price > 0)
        };
    }
    if (selectedVariant) {
        return {
            displayPrice: selectedVariant.askOnWA ? 'Tanya di WA' : formatCurrency(selectedVariant.price),
            strikethroughPrice: selectedVariant.strikethroughPrice ? formatCurrency(selectedVariant.strikethroughPrice) : undefined,
            isAskOnWA: !!selectedVariant.askOnWA
        };
    }
    return { displayPrice: "Pilih varian", isAskOnWA: false };
  }, [product, selectedVariant]);

  const handleQuickBuy = () => {
    if (isActionDisabled || isUnavailable) return;

    let message = '';
    const isService = priceInfo.isAskOnWA;

    if (isService) {
        message = `Halo, saya tertarik dengan *${product.name}*. Bisa minta informasi lebih lanjut mengenai portofolio dan proses kerjanya?`;
    } else {
        message = `Halo, saya ingin ${isPreOrder ? 'mengikuti pre-order' : 'memesan'} produk berikut dari *${storefrontSettings.name}*:\n\n`;
        let price = 0;
        let variantText = '';
        
        if (product.priceType === PriceType.SINGLE) {
            price = product.price ?? 0;
        } else if (selectedVariant) {
            price = selectedVariant.askOnWA ? 0 : selectedVariant.price;
            variantText = ` (${Object.values(selectedVariant.options).join(' / ')})`;
        }

        const itemTotalPrice = price * quantity;

        message += `*${product.name}*${variantText}\n`;
        message += `Jumlah: ${quantity}\n`;
        message += `Harga: ${price > 0 ? formatCurrency(itemTotalPrice) : 'Tanya harga'}\n\n`;
        message += `Mohon informasinya lebih lanjut. Terima kasih.`;
    }
    
    const whatsappUrl = `https://wa.me/${storefrontSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
    
  const isActionDisabled = product.priceType === PriceType.VARIANT && (!selectedVariant || selectedVariant.stockStatus === StockStatus.SOLDOUT);

  const isOptionDisabled = (group: VariantGroup, option: string) => {
    const tempOptions = { ...selectedOptions, [group.name]: option };
    
    return !product.variants.combinations.some(c =>
      c.stockStatus === StockStatus.AVAILABLE &&
      Object.entries(tempOptions).every(([key, value]) => {
          if(tempOptions[key]){
              return c.options[key] === value;
          }
          return true;
      })
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-sm text-gray-600">
            {/* Fix: Updated link to use storeSlug for correct navigation. */}
            <Link href={`/shop/${storeSlug}`} className="hover:underline hover:text-primary">
                Katalog
            </Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-gray-800 truncate">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-24 sm:pb-8">
            <div className="relative">
                <ImageGallery images={product.images} productName={product.name} />
                {isUnavailable && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                        <span className="px-4 py-2 text-sm font-bold text-white uppercase bg-gray-800/80 rounded-full shadow-lg">
                            Tidak Tersedia
                        </span>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col space-y-6">
                 {/* Header & Price */}
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">{product.name}</h1>
                    <div className="flex flex-wrap gap-2">
                        {isPreOrder && (
                            <span className="px-3 py-1 text-xs font-bold text-white uppercase bg-blue-600 rounded-full shadow-sm">
                                Pre-Order
                            </span>
                        )}
                        {product.badges.map(badge => (
                            <span key={badge} className="px-3 py-1 text-xs font-bold text-gray-800 uppercase bg-accent rounded-full shadow-sm">
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-baseline space-x-2 pt-2">
                        <p className="text-3xl font-bold text-gray-900">{priceInfo.displayPrice}</p>
                        {priceInfo.strikethroughPrice && <p className="text-xl text-gray-500 line-through">{priceInfo.strikethroughPrice}</p>}
                    </div>
                </div>

                {/* Sisa JSX lainnya dari ProductDetailView.tsx lama (varian, qty, cta, info) */}
            </div>
        </div>
      </div>
      {showToast && <Toast message="Ditambahkan ke Ringkasan" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default ProductDetailView;
