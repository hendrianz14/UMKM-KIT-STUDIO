import React from 'react';
import { useInView } from '../hooks/useInView';

// Icon components created to match the style and guidelines.
const UploadIcon = () => (
  <svg className="w-12 h-12 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
);
const ProcessIcon = () => (
    <svg className="w-12 h-12 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M12 11h.01M12 8h.01M15 8h.01M9 8h.01M4 4h16v16H4V4z"></path></svg>
);
const DownloadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);

const steps = [
  {
    icon: <UploadIcon />,
    title: 'Unggah Dokumen Anda',
    description: 'Cukup seret dan lepas file Anda ke platform kami. Kami mendukung berbagai format untuk kenyamanan Anda.',
  },
  {
    icon: <ProcessIcon />,
    title: 'AI Menganalisis Konten',
    description: 'Algoritma canggih kami memproses dan menganalisis dokumen Anda dalam hitungan detik untuk wawasan yang akurat.',
  },
  {
    icon: <DownloadIcon />,
    title: 'Unduh Hasilnya',
    description: 'Dapatkan hasil terstruktur dan wawasan yang dapat ditindaklanjuti. Ekspor dalam format yang Anda butuhkan.',
  },
];

const HowItWorks = () => {
    const [ref, isInView] = useInView({ threshold: 0.1 });

    return (
        <section className="bg-light font-sans py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
                        Bagaimana Cara Kerjanya?
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-secondary max-w-2xl mx-auto">
                        Kami telah menyederhanakan prosesnya menjadi tiga langkah mudah untuk membantu Anda mendapatkan hasil secepat mungkin.
                    </p>
                </div>

                <div 
                    ref={ref}
                    className={`mt-12 grid gap-8 md:grid-cols-3 transition-opacity duration-1000 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}
                >
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-lg relative overflow-hidden text-center">
                            <span className="absolute top-0 right-5 text-7xl font-black text-primary opacity-5 z-0">
                                {`0${index + 1}`}
                            </span>
                            <div className="relative z-10">
                                <div className="mb-5">
                                    {step.icon}
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                                <p className="text-base text-secondary">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
