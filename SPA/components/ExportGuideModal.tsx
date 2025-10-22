import React from 'react';
import { XIcon } from './icons/XIcon';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportGuideModal: React.FC<ExportGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Panduan Export & Deploy</h2>
          <button onClick={onClose}><XIcon /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <p>Aplikasi ini dibuat sebagai <strong>Single Page Application (SPA)</strong> yang siap untuk di-deploy di berbagai platform hosting statis seperti Vercel, Netlify, atau GitHub Pages.</p>
          
          <h3 className="font-semibold text-lg pt-2">Langkah 1: Export Data</h3>
          <p>Saat ini, semua data produk dan pengaturan toko Anda disimpan di dalam kode aplikasi (mock data). Untuk versi production, Anda perlu mengekstrak data ini ke dalam format JSON atau menghubungkannya ke sebuah backend/CMS.</p>
          <p className="text-sm bg-yellow-100 p-3 rounded-md"><strong>Contoh:</strong> Anda bisa membuat sebuah file `data.json` di folder `public` dan mengambil data dari sana menggunakan `fetch`.</p>

          <h3 className="font-semibold text-lg pt-2">Langkah 2: Build Aplikasi</h3>
          <p>Untuk membuat versi production dari aplikasi ini, jalankan perintah berikut di terminal Anda:</p>
          <pre className="bg-gray-800 text-white p-3 rounded-md text-sm"><code>npm run build</code></pre>
          <p>Perintah ini akan membuat folder `build` (atau `dist`) yang berisi semua file statis (HTML, CSS, JavaScript) yang siap untuk di-deploy.</p>
          
          <h3 className="font-semibold text-lg pt-2">Langkah 3: Deploy</h3>
          <p>Unggah isi dari folder `build` ke provider hosting pilihan Anda. Kebanyakan provider modern akan secara otomatis mendeteksi bahwa ini adalah aplikasi React dan mengkonfigurasikannya dengan benar.</p>
          <p>Pastikan untuk mengatur "rewrite rules" agar semua rute (misalnya `/shop/toko-Anda/product/nama-produk`) mengarah ke `index.html`. Ini penting agar routing di sisi client berfungsi.</p>
        </div>
        <div className="p-4 bg-gray-50 text-right rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary">Mengerti</button>
        </div>
      </div>
    </div>
  );
};

export default ExportGuideModal;