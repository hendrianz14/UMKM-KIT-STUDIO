'use client';

import React, { useState } from 'react';
import { useInView } from '@/lib/hooks/useInView';

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);


const pricingData = [
    {
        plan: "Free",
        price: "Gratis",
        period: "",
        description: "Coba fitur dasar kami tanpa biaya apa pun.",
        features: [
            "5 Generasi Gambar/Bulan",
            "10 Generasi Caption/Bulan",
            "Akses Template Terbatas",
            "1 Akun Media Sosial"
        ],
        isPopular: false,
        category: 'Personal'
    },
    {
        plan: "Basic",
        price: "150rb",
        period: "/bulan",
        description: "Ideal untuk memulai dan membangun kehadiran online.",
        features: [
            "50 Generasi Gambar/Bulan",
            "100 Generasi Caption/Bulan",
            "Akses Template Dasar",
            "2 Akun Media Sosial"
        ],
        isPopular: false,
        category: 'Personal'
    },
    {
        plan: "Pro",
        price: "450rb",
        period: "/bulan",
        description: "Untuk kreator dan UMKM yang butuh lebih banyak.",
        features: [
            "200 Generasi Gambar/Bulan",
            "Generasi Caption Tanpa Batas",
            "Akses Semua Template Premium",
            "5 Akun Media Sosial",
            "Dukungan Prioritas"
        ],
        isPopular: true,
        category: 'Personal'
    },
    {
        plan: "Enterprise",
        price: "Hubungi Kami",
        period: "",
        description: "Solusi lengkap untuk agensi dan bisnis skala besar.",
        features: [
            "Semua di paket Pro",
            "Kustomisasi Template Lanjutan",
            "Manajer Akun Dedikasi",
            "Analitik Performa Konten",
            "Integrasi API"
        ],
        isPopular: false,
        category: 'Bisnis'
    }
];

const Pricing: React.FC = () => {
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const [activeCategory, setActiveCategory] = useState<'Personal' | 'Bisnis'>('Personal');

    const filteredPlans = pricingData.filter(plan => plan.category === activeCategory);
    
    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Paket Harga yang Fleksibel</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Pilih paket yang paling sesuai dengan kebutuhan dan anggaran bisnis Anda.
                    </p>
                </div>

                <div className="flex justify-center mb-10">
                  <div className="bg-gray-200 rounded-full p-1 flex space-x-1">
                    <button 
                      onClick={() => setActiveCategory('Personal')}
                      className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 ${activeCategory === 'Personal' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-white/60'}`}
                    >
                      Personal
                    </button>
                    <button 
                      onClick={() => setActiveCategory('Bisnis')}
                      className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 ${activeCategory === 'Bisnis' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-white/60'}`}
                    >
                      Bisnis
                    </button>
                  </div>
                </div>

                <div key={activeCategory} ref={ref} className="flex flex-wrap justify-center -mx-4">
                    {filteredPlans.map((plan, index) => (
                        <div key={plan.plan} className={`p-4 transition-all duration-300 ${filteredPlans.length === 1 ? 'w-full md:w-2/3 lg:w-1/2' : 'w-full md:w-1/2 lg:w-1/3'}`}>
                            <div className={`border-2 rounded-lg p-8 h-full flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:shadow-primary/20 ${plan.isPopular ? 'border-accent shadow-2xl animate-subtlePulse' : 'border-gray-200 shadow-lg'} ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: `${index * 150}ms` }}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent text-primary text-sm font-bold px-4 py-1 rounded-full">
                                        PALING POPULER
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-primary text-center">{plan.plan}</h3>
                                <p className="text-center text-gray-500 mt-2 mb-6">{plan.description}</p>
                                <div className="text-center mb-6">
                                    <span className={`text-4xl font-extrabold text-primary ${plan.price === 'Hubungi Kami' || plan.price === 'Gratis' ? 'text-3xl' : ''}`}>{plan.price}</span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckIcon />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <a href="#" className={`w-full text-center font-bold py-3 px-6 rounded-full transition duration-300 block ${plan.isPopular ? 'bg-accent text-primary hover:bg-yellow-500' : 'bg-secondary text-white hover:bg-primary'}`}>
                                    {plan.price === 'Hubungi Kami' ? 'Kontak Sales' : (plan.price === 'Gratis' ? 'Coba Gratis' : 'Pilih Paket')}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
