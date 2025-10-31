"use client";

import React, { useState } from 'react';
import { SelectInput } from './SelectInput';

export type OnboardingFormData = {
  businessName: string;
  mainPurpose: string;
  businessType: string;
  source: string;
};

interface OnboardingDialogProps {
  // Called only after successful save to close the dialog
  onClose: () => void;
}

export default function OnboardingDialog({ onClose }: OnboardingDialogProps) {
  const [businessName, setBusinessName] = useState('');
  const [mainPurpose, setMainPurpose] = useState('');
  const [businessType, setBusinessType] = useState('Kuliner');
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const allFilled = businessName.trim() && mainPurpose && businessType && source;

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const formData: OnboardingFormData = {
        businessName,
        mainPurpose,
        businessType,
        source,
      };
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Gagal menyimpan jawaban');
      }
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-800 bg-[#161B22] p-8 shadow-2xl shadow-black/20">
        <div>
          <h1 className="text-3xl font-bold text-white">Kenalan dulu yuk!</h1>
          <p className="mt-2 text-gray-400">
            Jawaban kamu sangat membantu kami menyesuaikan halaman anda.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="mt-8 space-y-6"
        >
          <div>
            <label htmlFor="business-name" className="mb-2 block text-sm font-medium text-gray-300">
              Masukan nama Usaha atau Bisnis
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Kopi Kenangan"
              className="w-full rounded-lg border border-gray-700 bg-[#21262D] px-4 py-3 leading-tight text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SelectInput
            label="Tujuan utama pakai UKM Kits"
            value={mainPurpose}
            onChange={(e) => setMainPurpose(e.target.value)}
            options={purposeOptions}
            placeholder="Pilih tujuan utama"
          />

          <SelectInput
            label="Jenis usaha"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            options={businessTypeOptions}
          />

          <SelectInput
            label="Dari mana tahu UKM Kits?"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={sourceOptions}
            placeholder="Pilih sumber"
          />
        </form>

        {error && (
          <div className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !allFilled}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#161B22] disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan jawaban'}
          </button>
        </div>
      </div>
    </div>
  );
}
