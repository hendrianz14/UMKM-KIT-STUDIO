'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Accordion from '../Accordion';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import {
  PriceType,
  Product,
  ProductImage,
} from '@/lib/storefront/types';
import {
  convertNewlinesToParagraphs,
  formatCurrency,
  getProductPriceRange,
} from '@/lib/storefront/utils';

interface PreviewViewProps {
  product: Product | Omit<Product, 'id' | 'slug' | 'updatedAt'>;
  onBackToEdit: () => void;
}

const PreviewView = ({ product, onBackToEdit }: PreviewViewProps) => {
  const selectedImage: ProductImage | undefined = useMemo(
    () =>
      product.images.find((image) => image.id === product.coverImageId) ??
      product.images[0],
    [product.images, product.coverImageId],
  );

  const priceInfo = useMemo(() => {
    if (product.priceType === PriceType.SINGLE) {
      return {
        displayPrice:
          (product.price ?? 0) > 0
            ? formatCurrency(product.price ?? 0)
            : 'Tanya harga',
        strikethrough: product.strikethroughPrice
          ? formatCurrency(product.strikethroughPrice)
          : undefined,
      };
    }
    return {
      displayPrice: getProductPriceRange(product as Product).displayPrice,
      strikethrough: undefined,
    };
  }, [product]);

  const variants =
    product.priceType === PriceType.VARIANT ? product.variants : undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Pratinjau Halaman Produk</h2>
        <button
          onClick={onBackToEdit}
          className="flex items-center space-x-2 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeftIcon />
          <span>Kembali ke Editor</span>
        </button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-lg sm:p-8">
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText || product.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                  Tidak ada foto
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 ${selectedImage?.id === image.id ? 'border-secondary ring-2 ring-secondary' : 'border-transparent'}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `Thumbnail ${product.name}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {('badges' in product ? product.badges : []).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {('badges' in product ? product.badges : []).map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-accent/80 px-2.5 py-1 text-xs font-bold text-primary"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {priceInfo.displayPrice}
              </p>
              {priceInfo.strikethrough && (
                <p className="ml-3 text-xl text-gray-500 line-through">
                  {priceInfo.strikethrough}
                </p>
              )}
            </div>

            <div className="mt-6">
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: convertNewlinesToParagraphs(
                    product.longDescription || product.shortDescription,
                  ),
                }}
              />
            </div>

            {variants && variants.groups.length > 0 && (
              <div className="mt-8 space-y-4">
                {variants.groups.map((group) => (
                  <div key={group.id}>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      {group.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => (
                        <span
                          key={option}
                          className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
              Tombol aksi (Tambah ke Ringkasan, Beli Cepat) akan muncul di sini.
            </div>
          </div>
        </div>

        {('faq' in product ? product.faq : []).length > 0 && (
          <div className="mt-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Tanya Jawab</h2>
            <div className="divide-y divide-gray-200 rounded-md border border-gray-200">
              {('faq' in product ? product.faq : []).map((item) => (
                <Accordion key={item.id} title={item.question}>
                  <p className="text-gray-700">{item.answer}</p>
                </Accordion>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewView;
