import React, { useState } from 'react';
import ExportGuideModal from '../../components/ExportGuideModal';
import { RocketIcon } from '../../components/icons/RocketIcon';

const DeployView: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <h1 className="text-3xl font-bold text-primary mb-2">Deploy & Export</h1>
            <p className="text-md text-gray-600 mb-8">Siapkan toko Anda untuk go-live dan pelajari cara mengekspor data.</p>

            <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <div className="mx-auto bg-blue-100 text-secondary rounded-full h-16 w-16 flex items-center justify-center">
                    <RocketIcon />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Siap untuk Go-Live?</h2>
                <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                    Toko online Anda adalah aplikasi web modern yang bisa di-host di mana saja. Klik tombol di bawah untuk melihat panduan langkah-demi-langkah untuk melakukan deployment.
                </p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 bg-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary transition duration-300"
                >
                    Lihat Panduan Deploy
                </button>
            </div>
            
            <ExportGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default DeployView;