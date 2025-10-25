import React, { useState } from 'react';
import { SelectInput } from './components/SelectInput';

const App: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [mainPurpose, setMainPurpose] = useState('');
  const [businessType, setBusinessType] = useState('Kuliner');
  const [source, setSource] = useState('');

  const handleSave = () => {
    const formData = {
      businessName,
      mainPurpose,
      businessType,
      source,
    };
    console.log('Form Data Saved:', formData);
    alert(`Jawaban disimpan! Cek console untuk melihat datanya.\n${JSON.stringify(formData, null, 2)}`);
  };

  const purposeOptions = [
    { value: 'content', label: 'Membuat konten promosi' },
    { value: 'branding', label: 'Meningkatkan branding usaha' },
    { value: 'store', label: 'Membuat toko online personal' },
    { value: 'catalog', label: 'Membuat katalog produk' },
    { value: 'chat', label: 'Otomatisasi chat' },
    { value: 'other', label: 'Lainnya' },
  ];

  const businessTypeOptions = [
    { value: 'Kuliner', label: 'Kuliner' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Jasa', label: 'Jasa' },
    { value: 'Kecantikan', label: 'Kecantikan' },
    { value: 'Retail', label: 'Retail' },
  ];

  const sourceOptions = [
    { value: 'social_media', label: 'Media Sosial' },
    { value: 'friends', label: 'Teman/Keluarga' },
    { value: 'google', label: 'Pencarian Google' },
    { value: 'ads', label: 'Iklan' },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-lg bg-[#161B22] rounded-2xl p-8 space-y-8 border border-gray-800 shadow-2xl shadow-black/20">
        <div>
          <h1 className="text-3xl font-bold text-white">Kenalan dulu yuk!</h1>
          <p className="mt-2 text-gray-400">
            Jawaban kamu sangat membantu kami menyesuaikan halaman anda.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-300 mb-2">
              Masukan nama Usaha atau Bisnis
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Kopi Kenangan"
              className="w-full bg-[#21262D] border border-gray-700 text-white py-3 px-4 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Main Purpose */}
          <SelectInput
            label="Tujuan utama pakai UMKM KitStudio"
            value={mainPurpose}
            onChange={(e) => setMainPurpose(e.target.value)}
            options={purposeOptions}
            placeholder="Pilih tujuan utama"
          />

          {/* Business Type */}
           <SelectInput
            label="Jenis usaha"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            options={businessTypeOptions}
          />
          
          {/* Source */}
          <SelectInput
            label="Dari mana tahu UMKM KitStudio?"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={sourceOptions}
            placeholder="Pilih sumber"
          />
        </form>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161B22] focus:ring-blue-500"
          >
            Simpan jawaban
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
