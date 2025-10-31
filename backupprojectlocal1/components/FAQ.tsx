'use client';

import React, { useState } from 'react';
import { useInView } from '@/lib/hooks/useInView';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-medium text-primary focus:outline-none"
                onClick={onClick}
            >
                <span>{question}</span>
                <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-gray-600">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const faqData = [
    {
        question: "Apa itu UKM Kits?",
        answer: "UKM Kits adalah platform berbasis AI yang membantu UMKM membuat konten media sosial berkualitas tinggi—seperti gambar, caption, dan desain—dengan cepat dan mudah."
    },
    {
        question: "Apakah saya perlu keahlian teknis atau desain?",
        answer: "Tidak sama sekali. Platform kami dirancang untuk membuat proses kreatif menjadi intuitif. Jika Anda bisa mengetik sebuah ide, Anda bisa membuat konten yang luar biasa tanpa perlu skill desain."
    },
    {
        question: "Bisakah saya meng-upgrade paket saya nanti?",
        answer: "Tentu saja. Anda dapat dengan mudah meng-upgrade atau me-downgrade paket Anda kapan saja sesuai dengan pertumbuhan dan kebutuhan bisnis Anda. Prosesnya cepat dan tidak akan mengganggu operasional bisnis Anda."
    },
    {
        question: "Apakah ada dukungan pelanggan jika saya mengalami kesulitan?",
        answer: "Ya, kami menyediakan dukungan pelanggan yang siap membantu Anda. Pelanggan paket Pro dan Enterprise akan mendapatkan dukungan prioritas untuk respons yang lebih cepat."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-light">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Pertanyaan yang Sering Diajukan</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Temukan jawaban cepat untuk pertanyaan umum tentang layanan kami.
                    </p>
                </div>
                <div ref={ref} className={`max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg transition-all duration-500 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
                    {faqData.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleClick(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
