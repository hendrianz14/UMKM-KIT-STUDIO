'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from '@/lib/hooks/useInView';

// Reusable Image Comparison Slider Component
interface ImageComparisonSliderProps {
    beforeImg: string;
    afterImg: string;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ beforeImg, afterImg }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, [isDragging]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleMove(e.clientX);
    }, [handleMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    const handleUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    const handleDown = () => {
        setIsDragging(true);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchend', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging, handleMouseMove, handleTouchMove, handleUp]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-[4/3] select-none cursor-ew-resize overflow-hidden rounded-lg"
            onMouseDown={handleDown}
            onTouchStart={handleDown}
        >
            <img src={afterImg} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`}}>
                <img src={beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                     <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
        </div>
    );
};

const previewData = [
    {
        title: "Foto Produk Kusam -> Profesional",
        beforeImg: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&blend=a4a4a4&sat=-100&bri=-20",
        afterImg: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Desain Simpel -> Menarik",
        beforeImg: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&blend=a4a4a4&sat=-100&bri=-20",
        afterImg: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Pencahayaan Biasa -> Dramatis",
        beforeImg: "https://images.unsplash.com/photo-1526398977652-25a233b67023?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&blend=a4a4a4&sat=-100&bri=-20",
        afterImg: "https://images.unsplash.com/photo-1526398977652-25a233b67023?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    }
];

const Preview: React.FC = () => {
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

    return (
        <section id="preview" className="py-20 bg-light">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Lihat Keajaibannya Secara Langsung</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Geser untuk melihat bagaimana AI kami mengubah konten biasa menjadi luar biasa dalam sekejap.
                    </p>
                </div>
                <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {previewData.map((item, index) => (
                        <div 
                            key={index} 
                            className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-primary/20 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}
                            style={{ animationDelay: `${index * 150}ms`}}
                        >
                            <h3 className="text-xl font-bold text-primary mb-4 text-center">{item.title}</h3>
                            <ImageComparisonSlider beforeImg={item.beforeImg} afterImg={item.afterImg} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Preview;
