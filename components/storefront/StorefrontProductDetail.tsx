'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageGallery from './ImageGallery';
import QuantityStepper from './QuantityStepper';
import Accordion from './Accordion';
import Toast from './Toast';
import CheckIcon from './icons/CheckIcon';
import CartIcon from './icons/CartIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import { useStorefront } from './StorefrontProvider';
import {
  PriceType,
  Product,
  ProductStatus,
  StockStatus,
  VariantCombination,
  VariantGroup,
} from '@/lib/storefront/types';
import {
  convertNewlinesToParagraphs,
  formatCurrency,
} from '@/lib/storefront/utils';
import { trackEvent } from '@/lib/analytics/client';

interface StorefrontProductDetailProps {
  storeSlug: string;
  product: Product;
  isPreviewMode?: boolean;
  onBackToCatalog?: () => void;
}

const StorefrontProductDetail = ({
  storeSlug,
  product: fallbackProduct,
  isPreviewMode = false,
  onBackToCatalog,
}: StorefrontProductDetailProps) => {
  const router = useRouter();
  const { storefront, products, addToQuote } = useStorefront();

  const product = useMemo(() => {
    return (
      products.find((candidate) => candidate.id === fallbackProduct.id) ??
      fallbackProduct
    );
  }, [products, fallbackProduct]);

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (!product || product.priceType !== PriceType.VARIANT) {
      setSelectedOptions({});
      return;
    }

    const initialOptions: Record<string, string> = {};
    product.variants.groups.forEach((group) => {
      const firstAvailableOption = group.options.find((option) => {
        const tempSelection = { ...initialOptions, [group.name]: option };
        return product.variants.combinations.some(
          (combination) =>
            combination.stockStatus === StockStatus.AVAILABLE &&
            Object.entries(tempSelection).every(
              ([key, value]) => combination.options[key] === value,
            ),
        );
      });

      if (firstAvailableOption) {
        initialOptions[group.name] = firstAvailableOption;
      }
    });

    setSelectedOptions(initialOptions);
  }, [product]);

  // Track product view
  useEffect(() => {
    try {
      if (storefront?.id && product?.id) {
        trackEvent({ type: 'product_view', storeId: storefront.id, productId: product.id });
      }
    } catch {}
  }, [storefront?.id, product?.id]);

  const selectedVariant = useMemo<VariantCombination | null>(() => {
    if (!product || product.priceType !== PriceType.VARIANT) return null;
    if (Object.keys(selectedOptions).length < product.variants.groups.length) {
      return null;
    }

    return (
      product.variants.combinations.find((combination) =>
        Object.entries(selectedOptions).every(
          ([key, value]) => combination.options[key] === value,
        ),
      ) ?? null
    );
  }, [product, selectedOptions]);

  const handleVariantSelect = (groupName: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleBack = () => {
    if (isPreviewMode && onBackToCatalog) {
      onBackToCatalog();
      return;
    }
    router.push(`/shop/${storeSlug}`);
  };

  const isUnavailable = product.status === ProductStatus.UNAVAILABLE;
  const isPreOrder = product.status === ProductStatus.PRE_ORDER;

  const handleAddToQuote = () => {
    if (isActionDisabled || isUnavailable) return;

    addToQuote({
      productId: product.id,
      variantId:
        product.priceType === PriceType.VARIANT ? selectedVariant?.id : undefined,
      quantity,
      notes: '',
    });
    setShowToast(true);
  };

  const priceInfo = useMemo(() => {
    if (product.priceType === PriceType.SINGLE) {
      return {
        displayPrice:
          product.price && product.price > 0
            ? formatCurrency(product.price)
            : 'Tanya di WA',
        isAskOnWA: !(product.price && product.price > 0),
      };
    }

    if (!selectedVariant) {
      return { displayPrice: 'Pilih varian', isAskOnWA: false };
    }

    if (selectedVariant.askOnWA) {
      return { displayPrice: 'Tanya di WA', isAskOnWA: true };
    }

    if (selectedVariant.strikethroughPrice) {
      return {
        displayPrice: `${formatCurrency(selectedVariant.price)} (Diskon dari ${formatCurrency(selectedVariant.strikethroughPrice)})`,
        isAskOnWA: false,
      };
    }

    return {
      displayPrice: formatCurrency(selectedVariant.price),
      isAskOnWA: false,
    };
  }, [product, selectedVariant]);

  const handleQuickBuy = () => {
    if (isActionDisabled || isUnavailable || !storefront) return;

    // Fire analytics for WhatsApp click from product page
    try {
      trackEvent({ type: 'wa_click', storeId: storefront.id, productId: product.id, source: 'product' });
    } catch {}

    let message = '';
    const isService = priceInfo.isAskOnWA;

    if (isService) {
      message = `Halo, saya tertarik dengan *${product.name}*. Bisa minta informasi lebih lanjut mengenai portofolio dan proses kerjanya?`;
    } else {
      message = `Halo, saya ingin ${isPreOrder ? 'mengikuti pre-order' : 'memesan'} produk berikut dari *${storefront.name}*:\n\n`;
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
      message += `Harga: ${
        price > 0 ? formatCurrency(itemTotalPrice) : 'Tanya harga'
      }\n\n`;
      message += `Mohon informasinya lebih lanjut. Terima kasih.`;
    }

    const whatsappUrl = `https://wa.me/${storefront.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const isActionDisabled =
    product.priceType === PriceType.VARIANT &&
    (!selectedVariant || selectedVariant.stockStatus === StockStatus.SOLDOUT);

  const isOptionDisabled = (group: VariantGroup, option: string) => {
    if (!product || product.priceType !== PriceType.VARIANT) return false;

    const tempOptions = { ...selectedOptions, [group.name]: option };

    return !product.variants.combinations.some(
      (combination) =>
        combination.stockStatus === StockStatus.AVAILABLE &&
        Object.entries(tempOptions).every(([key, value]) => {
          if (!tempOptions[key]) {
            return true;
          }
          return combination.options[key] === value;
        }),
    );
  };

  const coverImage =
    product.images.find((image) => image.id === product.coverImageId) ??
    product.images[0];

  return (
    <>
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={handleBack}
          className="mb-6 text-sm font-semibold text-primary transition hover:text-secondary"
        >
          &larr; Kembali ke Katalog
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <ImageGallery images={product.images} productName={product.name} />
            {isUnavailable && (
              <div className="mt-4 flex items-center space-x-2 rounded-lg bg-amber-100 p-4 text-amber-700">
                <AlertTriangleIcon />
                <span>Produk ini sedang tidak tersedia.</span>
              </div>
            )}
            {isPreOrder && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-700">
                <p className="font-semibold">
                  Produk ini dijual dengan sistem Pre-Order.
                </p>
                {product.preOrderEstimate && (
                  <p className="text-sm">
                    Estimasi pengerjaan: {product.preOrderEstimate}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-sm text-gray-500">Kategori: {product.category}</p>
              <p className="mt-4 text-2xl font-extrabold text-primary">
                {priceInfo.displayPrice}
              </p>
              {product.strikethroughPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.strikethroughPrice)}
                </p>
              )}
              {coverImage && (
                <p className="mt-2 text-sm text-gray-500">
                  SKU: {product.slug.toUpperCase()}
                </p>
              )}
            </div>

            {product.priceType === PriceType.VARIANT && (
              <div className="space-y-6">
                {product.variants.groups.map((group) => (
                  <div key={group.id}>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Pilih {group.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedOptions[group.name] === option;
                        const disabled = isOptionDisabled(group, option);

                        return (
                          <button
                            key={option}
                            onClick={() => handleVariantSelect(group.name, option)}
                            disabled={disabled}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              isSelected
                                ? 'bg-secondary text-white'
                                : 'border bg-white text-gray-700 hover:bg-gray-100'
                            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isUnavailable && (
              <>
                <QuantityStepper quantity={quantity} setQuantity={setQuantity} />

                <div className="hidden space-y-4 sm:block">
                  <div className="grid gap-4">
                    <button
                      onClick={handleAddToQuote}
                      disabled={isActionDisabled}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-secondary px-6 py-3 font-bold text-white shadow-md transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <CheckIcon />
                      <span>
                        {isPreOrder ? 'Tambah PO ke Ringkasan' : 'Tambah ke Ringkasan'}
                      </span>
                    </button>
                    <button
                      onClick={handleQuickBuy}
                      disabled={isActionDisabled}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-700 px-6 py-3 font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <WhatsAppIcon />
                      <span>
                        {isPreOrder ? 'Ikut PO via WhatsApp' : 'Beli Cepat via WhatsApp'}
                      </span>
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-500">
                    Pembayaran & pengiriman dikonfirmasi via WhatsApp.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-4 pt-4">
              <p className="text-gray-700">{product.shortDescription}</p>

              {product.longDescription && (
                <Accordion title="Selengkapnya">
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: convertNewlinesToParagraphs(product.longDescription),
                    }}
                  />
                </Accordion>
              )}

              {product.specs.map((spec) => (
                <Accordion key={spec.id} title={spec.title}>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {spec.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </Accordion>
              ))}

              {product.faq.map((faq) => (
                <Accordion key={faq.id} title={faq.question}>
                  <p className="text-gray-700">{faq.answer}</p>
                </Accordion>
              ))}

              {(storefront.locationText || storefront.hoursText) && (
                <Accordion title="Informasi Toko">
                  <div className="space-y-2 text-gray-700">
                    {storefront.locationText && <p>{storefront.locationText}</p>}
                    {storefront.hoursText && <p>{storefront.hoursText}</p>}
                  </div>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isUnavailable && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] sm:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToQuote}
              disabled={isActionDisabled}
              className="rounded-lg border border-gray-300 p-3 text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
              aria-label={
                isPreOrder ? 'Tambah PO ke Ringkasan' : 'Tambah ke Ringkasan'
              }
            >
              <CartIcon />
            </button>
            <button
              onClick={handleQuickBuy}
              disabled={isActionDisabled}
              className="flex flex-grow items-center justify-center space-x-2 rounded-lg bg-green-700 px-4 py-3 font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <WhatsAppIcon />
              <span>{isPreOrder ? 'Ikut PO via WhatsApp' : 'Pesan Sekarang'}</span>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            Pembayaran & pengiriman dikonfirmasi via WhatsApp.
          </p>
        </div>
      )}

      {showToast && (
        <Toast
          message="Ditambahkan ke Ringkasan"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default StorefrontProductDetail;
