'use client';

import React, { useState } from 'react';
import type { StorefrontProductImage } from '@/types/storefront.types';

interface ImageGalleryProps {
  images: StorefrontProductImage[];
  fallbackAlt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, fallbackAlt }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages =
    images.length > 0
      ? images
      : [
          {
            id: 'placeholder',
            url: 'https://dummyimage.com/1200x800/f5f5f5/0d47a1&text=KitStudio',
            alt: null,
            sortOrder: 0,
          },
        ];

  const activeImage = safeImages[Math.min(activeIndex, safeImages.length - 1)];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg">
        <img
          src={activeImage.url}
          alt={activeImage.alt ?? fallbackAlt}
          className="h-full w-full object-cover"
        />
      </div>
      {safeImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto">
          {safeImages.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                index === activeIndex ? 'border-primary ring-2 ring-primary/30' : 'border-blue-100'
              }`}
            >
              <img src={image.url} alt={image.alt ?? fallbackAlt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ImageGallery;
