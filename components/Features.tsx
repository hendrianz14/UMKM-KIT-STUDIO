'use client';

import React from 'react';
import { useInView } from '@/lib/hooks/useInView';

const FeatureIcon: React.FC<{ path: string }> = ({ path }) => (
    <div className="bg-blue-100 p-4 rounded-full mb-4 inline-block">
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
        </svg>
    </div>
);

const featureData = [
    {
        iconPath: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
        title: "Generator Gambar AI",
        description: "Buat visual yang memukau untuk produk Anda tanpa skill desain. Cukup tuliskan idenya, AI kami yang akan mewujudkannya."
    },
    {
        iconPath: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z",
        title: "Penulis Caption AI",
        description: "Dapatkan caption yang menarik dan menjual untuk setiap postingan. Sesuaikan gaya bahasa sesuai target audiens Anda."
    },
    {
        iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        title: "Template Desain Profesional",
        description: "Pilih dari ratusan template siap pakai yang bisa disesuaikan untuk promosi, pengumuman, atau konten harian."
    },
    {
        iconPath: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
        title: "Materi Siap Posting",
        description: "Gabungkan gambar, caption, dan desain menjadi satu materi utuh yang siap diunggah ke semua platform media sosial Anda."
    }
];

const Features: React.FC = () => {
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Ciptakan Konten Viral dalam Sekejap</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Fokus pada interaksi dengan pelanggan, biarkan AI kami yang mengurus pembuatan konten kreatif untuk Anda.
          </p>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureData.map((feature, index) => (
                <div 
                    key={index} 
                    className={`bg-light p-8 rounded-lg shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-primary/20 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 150}ms`}}
                >
                    <FeatureIcon path={feature.iconPath} />
                    <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
