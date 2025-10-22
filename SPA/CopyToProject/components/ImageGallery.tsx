'use client';

import React, { useState, useEffect } from 'react';
import { ProductImage } from '@/types';
import { XIcon } from './icons/XIcon';
import { ImagePlusIcon } from './icons/ImagePlusIcon';

interface ImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

const Lightbox: React.FC<{ image: ProductImage; onClose: () => void }> = ({ image, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={onClose}>
                <XIcon />
            </button>
            <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
                <img src={image.url} alt={image.altText || 'Gambar produk diperbesar'} className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            </div>
        </div>
    );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images[0] || null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        setSelectedImage(images[0] || null);
    }, [images]);

    if (images.length === 0) {
        return (
             <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center text-gray-500">
                    <ImagePlusIcon />
                    <p className="mt-2 text-sm">Tidak ada foto</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg shadow-lg cursor-pointer" onClick={() => selectedImage && setIsLightboxOpen(true)}>
                {selectedImage && <img src={selectedImage.url} alt={selectedImage.altText || productName} className="w-full h-full object-center object-cover" />}
            </div>

            {images.length > 1 && (
                <div className="w-full">
                    <div className="flex space-x-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:gap-4 lg:space-x-0">
                        {images.map(image => (
                            <button
                                key={image.id}
                                onClick={() => setSelectedImage(image)}
                                className={`flex-shrink-0 w-20 h-20 lg:w-full lg:h-auto lg:aspect-square rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary
                                    ${selectedImage?.id === image.id ? 'border-secondary ring-2 ring-secondary' : 'border-transparent hover:border-gray-400'}`}
                            >
                                <img src={image.url} alt={image.altText || `Thumbnail ${productName}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isLightboxOpen && selectedImage && <Lightbox image={selectedImage} onClose={() => setIsLightboxOpen(false)} />}
        </div>
    );
};

export default ImageGallery;