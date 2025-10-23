'use client';

import { useEffect, useState } from 'react';
import SafeImage from './SafeImage';
import type { ProductImage } from '@/lib/storefront/types';
import XIcon from './icons/XIcon';
import ImagePlusIcon from './icons/ImagePlusIcon';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

const Lightbox = ({
  image,
  onClose,
}: {
  image: ProductImage;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute right-4 top-4 text-white transition hover:text-gray-300"
        onClick={onClose}
        aria-label="Tutup galeri"
      >
        <XIcon />
      </button>
      <div
        className="relative max-h-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[60vh] w-[80vw] max-w-4xl">
          <SafeImage
            src={image.url}
            alt={image.altText || 'Gambar produk'}
            fill
            className="rounded-lg object-contain shadow-2xl"
            sizes="(max-width: 1024px) 90vw, 60vw"
          />
        </div>
      </div>
    </div>
  );
};

const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    images[0] ?? null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(images[0] ?? null);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-100">
        <div className="text-center text-gray-500">
          <ImagePlusIcon />
          <p className="mt-2 text-sm">Tidak ada foto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg shadow-lg"
        onClick={() => selectedImage && setIsLightboxOpen(true)}
      >
        {selectedImage && (
          <SafeImage
            src={selectedImage.url}
            alt={selectedImage.altText || productName}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="w-full">
          <div className="flex space-x-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:space-x-0 lg:grid-cols-5">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition focus:outline-none focus:ring-2 focus:ring-secondary sm:w-full ${selectedImage?.id === image.id ? 'border-secondary ring-2 ring-secondary' : 'border-transparent hover:border-gray-400'}`}
                aria-label={`Gambar ${productName}`}
              >
                <SafeImage
                  src={image.url}
                  alt={image.altText || productName}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {isLightboxOpen && selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setIsLightboxOpen(false)} />
      )}
    </div>
  );
};

export default ImageGallery;
