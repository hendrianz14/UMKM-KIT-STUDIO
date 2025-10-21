'use client';

import React, { useState, useEffect } from 'react';

const UIMockup: React.FC = () => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl w-full max-w-4xl h-auto" style={{ aspectRatio: '1200 / 600' }}>
        <div className="rounded-lg overflow-hidden h-full">
            <div className="bg-gray-900/70 backdrop-blur-sm p-4 h-full">
                <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex gap-4 h-[calc(100%-28px)]">
                    <div className="w-1/3 bg-gray-800/50 rounded-lg p-3 space-y-3">
                        <div className="h-6 bg-secondary/50 rounded"></div>
                        <div className="h-4 bg-secondary/30 rounded w-5/6"></div>
                        <div className="h-4 bg-secondary/30 rounded w-4/6"></div>
                        <div className="h-4 bg-secondary/30 rounded w-5/6"></div>
                    </div>
                    <div className="w-2/3 bg-gray-800/50 rounded-lg p-3 space-y-3">
                         <div className="h-24 bg-accent/20 rounded-lg"></div>
                         <div className="h-6 bg-secondary/50 rounded"></div>
                         <div className="h-4 bg-secondary/30 rounded w-full"></div>
                         <div className="h-4 bg-secondary/30 rounded w-4/5"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const Hero: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

  return (
    <section id="home" className="relative bg-primary overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 z-0">
            <div className="absolute bg-secondary/30 rounded-full w-96 h-96 -top-20 -left-20 animate-pulse duration-[5000ms]"></div>
            <div className="absolute bg-accent/20 rounded-full w-[500px] h-[500px] -bottom-40 -right-20 animate-pulse duration-[7000ms]"></div>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl"></div>
        </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className={`max-w-4xl mx-auto text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
          Buat Konten Sosial Media Profesional dengan AI
        </h1>
        <p className={`text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 transition-all duration-700 ease-out delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Hasilkan gambar, caption menarik, dan desain template siap posting dalam hitungan detik. Lupakan pusingnya membuat konten, fokus pada pengembangan bisnis Anda.
        </p>
        <div className={`flex justify-center space-x-4 transition-all duration-700 ease-out delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <a href="#pricing" className="bg-accent text-primary font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-lg">
            Lihat Paket
          </a>
          <a href="#features" className="bg-white/90 text-secondary font-bold py-3 px-8 rounded-full hover:bg-white transition duration-300 transform hover:scale-105 shadow-lg border border-gray-200/50">
            Pelajari Fitur
          </a>
        </div>
        <div className={`mt-16 transition-all duration-1000 ease-out delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <UIMockup />
        </div>
      </div>
    </section>
  );
};

export default Hero;
