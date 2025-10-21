import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { RocketIcon } from './icons/RocketIcon';

const steps = [
  {
    title: 'Selamat Datang!',
    content: 'Ini adalah panel admin untuk mengelola toko online Anda. Mari kita lihat fitur-fitur utamanya.',
  },
  {
    title: 'Manajemen Produk',
    content: 'Di halaman "Produk", Anda bisa menambah, mengubah, dan menghapus produk yang dijual.',
  },
  {
    title: 'Pengaturan Toko',
    content: 'Sesuaikan nama toko, link, dan nomor WhatsApp Anda di halaman "Pengaturan".',
  },
  {
    title: 'Publikasikan!',
    content: 'Setelah semuanya siap, jangan lupa untuk mempublikasikan toko Anda agar bisa diakses pelanggan.',
  },
];

const DemoWalkthrough: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white rounded-lg shadow-2xl p-5 z-50 animate-fadeInUp">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-100 text-secondary rounded-full"><RocketIcon /></span>
            <h3 className="font-bold text-lg text-primary">{steps[currentStep].title}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <XIcon />
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        {steps[currentStep].content}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Langkah {currentStep + 1} dari {steps.length}
        </span>
        <button onClick={handleNext} className="bg-secondary hover:bg-primary transition-colors text-white font-bold py-1.5 px-4 rounded-lg text-sm">
          {currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}
        </button>
      </div>
    </div>
  );
};

export default DemoWalkthrough;