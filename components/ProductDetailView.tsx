'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { formatCurrency, convertNewlinesToParagraphs } from '@/lib/utils.client';
import {
  Product,
  VariantCombination,
  StockStatus,
  PriceType,
  ProductStatus,
  ProductImage,
  VariantGroup,
  StorefrontSettings,
} from '@/types/storefront.types';
import Accordion from './Accordion';
import Toast from './Toast';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import ImageGallery from './ImageGallery';
import QuantityStepper from './QuantityStepper';
import { CheckIcon } from './icons/CheckIcon';
import { CartIcon } from './icons/CartIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ProductDetailViewProps {
  storeSlug: string;
  productSlug: string;
  isPreviewMode?: boolean;
  onBackToCatalog?: () => void;
  // Fix: Added optional props for Next.js compatibility.
  product?: Product;
  storefrontSettings?: StorefrontSettings;
  allProducts?: Product[];
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ storeSlug, productSlug, isPreviewMode = false, onBackToCatalog, product: productProp, storefrontSettings: settingsProp, allProducts }) => {
  const router = useRouter();
  // Fix: Prioritize passed props, fallback to context for CRA compatibility.
  const { storefrontSettings: settingsContext, products: productsContext, addToQuote } = useStore();
  const storefrontSettings = settingsProp || settingsContext;
  const products = allProducts || productsContext;

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  
  const product = useMemo(() => 
    productProp || // Use prop if available
    products.find(p => 
      p.slug === productSlug && 
      (isPreviewMode || p.status === ProductStatus.PUBLISHED || p.status === ProductStatus.UNAVAILABLE || p.status === ProductStatus.PRE_ORDER)
    ), 
    [products, productSlug, isPreviewMode, productProp]
  );
  
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
    setSelectedOptions(prev => ({
        ...prev,
        [groupName]: option
    }));
  };

  const handleBack = () => {
    if (isPreviewMode && onBackToCatalog) {
      onBackToCatalog();
      return;
    }

    router.push(`/shop/${storeSlug}`);
  }
  
  if (!product) {
    return (
        <div className="flex items-center justify-center min-h-screen text-center p-4">
            <div>
                 <h1 className="text-4xl font-bold text-primary">404</h1>
                 <h2 className="text-2xl font-semibold text-gray-800 mt-2">Produk Tidak Ditemukan</h2>
                 <p className="text-gray-600 mt-2">Maaf, produk yang Anda cari tidak ada atau telah dihapus.</p>
                 <button onClick={handleBack} className="mt-6 bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary transition duration-300">
                    &larr; Kembali ke Katalog
                </button>
            </div>
        </div>
    );
  }
  
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
            isAskOnWA: !(product.price && product.price > 0)
        };
    }
    if (selectedVariant) {
        return {
            displayPrice: selectedVariant.askOnWA ? 'Tanya di WA' : formatCurrency(selectedVariant.price),
            isAskOnWA: !!selectedVariant.askOnWA
        };
    }
    return { displayPrice: "Pilih varian", isAskOnWA: false };
  }, [product, selectedVariant]);

  const handleQuickBuy = () => {
    if (isActionDisabled || isUnavailable || !storefrontSettings) return;

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
            <button onClick={handleBack} className="hover:underline hover:text-primary">
                Katalog
            </button>
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
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">{product.name}</h1>
                    <div className="flex flex-wrap gap-2">
                        {isPreOrder && (
                            <span className="px-3 py-1 text-xs font-bold text-white uppercase bg-blue-600 rounded-full shadow-sm">
                                Pre-Order
                            </span>
                        )}
                        {product.badges && product.badges.length > 0 && (
                            product.badges.map(badge => (
                                <span key={badge} className="px-3 py-1 text-xs font-bold text-gray-800 uppercase bg-accent rounded-full shadow-sm">
                                    {badge}
                                </span>
                            ))
                        )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{priceInfo.displayPrice}</p>
                </div>

                {isPreOrder && (
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                        <p className="font-bold">Produk ini Pre-Order</p>
                        {product.preOrderEstimate && <p className="text-sm">Estimasi Selesai: {product.preOrderEstimate}</p>}
                    </div>
                )}
                
                {isUnavailable ? (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                        <div className="flex">
                            <div className="py-1"><AlertTriangleIcon /></div>
                            <div className="ml-3">
                                <p className="font-bold">Produk Tidak Tersedia</p>
                                <p className="text-sm">Produk ini sedang tidak dapat dipesan saat ini.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                <>
                    {/* Varian & Qty */}
                    <div className="space-y-6">
                        {product.priceType === PriceType.VARIANT && product.variants.groups.map(group => (
                            <div key={group.id}>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Pilih {group.name}:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {group.options.map(option => {
                                        const isActive = selectedOptions[group.name] === option;
                                        const isDisabled = isOptionDisabled(group, option);

                                        return (
                                        <div key={option} className="relative group">
                                            <button
                                                onClick={() => handleVariantSelect(group.name, option)}
                                                disabled={isDisabled}
                                                className={`border rounded-lg py-2 px-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary
                                                    ${isActive ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-800 border-gray-300'}
                                                    ${!isDisabled ? 'hover:border-secondary' : ''}
                                                    disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                            >
                                                {option}
                                            </button>
                                            {isDisabled && (
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    Habis
                                                </span>
                                            )}
                                        </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {product.priceType === PriceType.VARIANT && !selectedVariant && (
                            <p className="text-sm text-yellow-600">Pilih varian terlebih dahulu.</p>
                        )}
                        {selectedVariant?.stockStatus === StockStatus.SOLDOUT && (
                            <p className="text-sm text-red-600">Varian yang dipilih habis.</p>
                        )}
                        
                        <QuantityStepper quantity={quantity} setQuantity={setQuantity} />
                    </div>

                    {/* CTA Desktop */}
                    <div className="hidden sm:block space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={handleAddToQuote}
                                disabled={isActionDisabled}
                                className="w-full bg-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <CheckIcon />
                                <span>{isPreOrder ? 'Tambah PO ke Ringkasan' : 'Tambah ke Ringkasan'}</span>
                            </button>
                            <button
                                onClick={handleQuickBuy}
                                disabled={isActionDisabled}
                                className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-800 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <WhatsAppIcon />
                                <span>{isPreOrder ? 'Ikut PO via WhatsApp' : 'Beli Cepat via WhatsApp'}</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Pembayaran & pengiriman dikonfirmasi via WhatsApp.
                        </p>
                    </div>
                </>
                )}
                
                {/* Information */}
                <div className="space-y-4 pt-4">
                    <p className="text-gray-700">{product.shortDescription}</p>
                    {product.longDescription && (
                        <Accordion title="Selengkapnya">
                            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: convertNewlinesToParagraphs(product.longDescription) }} />
                        </Accordion>
                    )}
                    {product.specs.map(spec => (
                        <Accordion key={spec.id} title={spec.title}>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {spec.items.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </Accordion>
                    ))}
                    {product.faq.map(item => (
                        <Accordion key={item.id} title={item.question}>
                            <p className="text-gray-700">{item.answer}</p>
                        </Accordion>
                    ))}
                    {(storefrontSettings?.locationText || storefrontSettings?.hoursText) && (
                        <Accordion title="Informasi Toko">
                             <div className="space-y-2 text-gray-700">
                                {storefrontSettings.locationText && <p>📍 {storefrontSettings.locationText}</p>}
                                {storefrontSettings.hoursText && <p>⏰ {storefrontSettings.hoursText}</p>}
                            </div>
                        </Accordion>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Sticky Mobile CTA Bar */}
      {!isUnavailable && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-30">
            <div className="flex items-center gap-3">
                <button
                    onClick={handleAddToQuote}
                    disabled={isActionDisabled}
                    className="p-3 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition disabled:opacity-50"
                    aria-label={isPreOrder ? 'Tambah PO ke Ringkasan' : 'Tambah ke Ringkasan'}
                >
                    <CartIcon />
                </button>
                <button
                    onClick={handleQuickBuy}
                    disabled={isActionDisabled}
                    className="flex-grow bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-800 transition disabled:bg-gray-400 flex items-center justify-center space-x-2"
                >
                    <WhatsAppIcon />
                    <span>{isPreOrder ? 'Ikut PO via WhatsApp' : 'Pesan Sekarang'}</span>
                </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
                Pembayaran & pengiriman dikonfirmasi via WhatsApp.
            </p>
        </div>
      )}

      {showToast && <Toast message="Ditambahkan ke Ringkasan" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default ProductDetailView;
