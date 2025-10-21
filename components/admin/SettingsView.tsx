'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { StorefrontStatus, type StorefrontSettings } from '@/types/storefront.types';
import { ClipboardIcon } from '../icons/ClipboardIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { slugify, containsProfanity } from '@/lib/utils.client';

const SettingsView = () => {
  const { storefrontSettings, updateStorefrontSettings } = useStore();
  const [formData, setFormData] = useState<StorefrontSettings>(storefrontSettings);
  const [phoneError, setPhoneError] = useState<string>('');
  const [slugError, setSlugError] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!storefrontSettings.slug);


  useEffect(() => {
    setFormData(storefrontSettings);
  }, [storefrontSettings]);

  const validateSlug = (slug: string): string => {
    if (!slug) return '';
    if (slug.length < 3) {
      return 'URL Toko minimal harus 3 karakter.';
    }
    if (containsProfanity(slug)) {
      return 'URL Toko mengandung kata yang tidak diizinkan.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
        return;
    }

    if (name === 'slug') {
        const sluggedValue = slugify(value);
        setIsSlugManuallyEdited(sluggedValue !== '');
        setSlugError(validateSlug(sluggedValue));
        setFormData(prev => ({...prev, slug: sluggedValue}));
    } else if (name === 'name') {
        setFormData(prev => {
            const newFormData = {...prev, name: value};
            if (!isSlugManuallyEdited) {
                const newSlug = slugify(value);
                setSlugError(validateSlug(newSlug));
                newFormData.slug = newSlug;
            }
            return newFormData;
        });
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusChange = (status: StorefrontStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;

    if (!formData.whatsappNumber.startsWith('62')) {
      setPhoneError('Nomor WhatsApp harus diawali dengan 62.');
      return;
    }
    setPhoneError('');
    updateStorefrontSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const storefrontUrl = `${window.location.origin.replace(/\/$/, '')}/shop/${formData.slug}`;
  
  const handleCopyLink = () => {
      navigator.clipboard.writeText(storefrontUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const isStoreActive = formData.status === StorefrontStatus.PUBLISHED || formData.status === StorefrontStatus.UNLISTED;

  return (
    <>
      <h1 className="text-3xl font-bold text-primary mb-2">Pengaturan Storefront</h1>
      <p className="text-md text-gray-600 mb-8">Atur tampilan dan informasi dasar toko online Anda.</p>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Toko</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
          </div>
          
          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">URL Toko (Slug)</label>
            <input 
              type="text" 
              name="slug" 
              id="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              required 
              className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm ${slugError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="otomatis-dibuat-dari-nama-toko"
            />
             {slugError && <p className="mt-2 text-sm text-red-600">{slugError}</p>}
             <p className="mt-2 text-sm text-gray-500">
                URL lengkap: <span className="font-semibold text-gray-700 break-all">{storefrontUrl}</span>
            </p>
          </div>
          
          {/* WhatsApp Number */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
            <input type="text" name="whatsappNumber" id="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm ${phoneError ? 'border-red-500' : 'border-gray-300'}`} />
            {phoneError && <p className="mt-2 text-sm text-red-600">{phoneError}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="locationText" className="block text-sm font-medium text-gray-700">Lokasi Toko (Opsional)</label>
            <input type="text" name="locationText" id="locationText" value={formData.locationText || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" placeholder="e.g. Jl. Merdeka No. 17, Bandung" />
          </div>

          {/* Hours */}
          <div>
            <label htmlFor="hoursText" className="block text-sm font-medium text-gray-700">Jam Buka (Opsional)</label>
            <input type="text" name="hoursText" id="hoursText" value={formData.hoursText || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" placeholder="e.g. Buka Setiap Hari, 09:00 - 20:00" />
          </div>

          {/* Storefront Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status Storefront</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input id="status_off" name="status" type="radio" checked={formData.status === StorefrontStatus.OFF} onChange={() => handleStatusChange(StorefrontStatus.OFF)} className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300" />
                <label htmlFor="status_off" className="ml-3 block text-sm font-medium text-gray-700">Off (Toko tidak dapat diakses publik)</label>
              </div>
              <div className="flex items-center">
                <input id="status_unlisted" name="status" type="radio" checked={formData.status === StorefrontStatus.UNLISTED} onChange={() => handleStatusChange(StorefrontStatus.UNLISTED)} className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300" />
                <label htmlFor="status_unlisted" className="ml-3 block text-sm font-medium text-gray-700">Unlisted (Hanya bisa diakses via link)</label>
              </div>
              <div className="flex items-center">
                <input id="status_published" name="status" type="radio" checked={formData.status === StorefrontStatus.PUBLISHED} onChange={() => handleStatusChange(StorefrontStatus.PUBLISHED)} className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300" />
                <label htmlFor="status_published" className="ml-3 block text-sm font-medium text-gray-700">Published (Bisa diakses publik)</label>
              </div>
            </div>
          </div>

          {/* Catalog Toggle */}
          <div className="flex items-center justify-between">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tampilkan Katalog Produk</label>
                <p className="text-xs text-gray-500">Jika ON, publik dapat melihat daftar produk Anda.</p>
            </div>
            <label htmlFor="isCatalogEnabled" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isCatalogEnabled" id="isCatalogEnabled" checked={formData.isCatalogEnabled} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
          
          {isStoreActive && (
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto overflow-hidden">
                    <span className="text-sm font-medium text-gray-900">Link Katalog Anda</span>
                    <p className="text-sm text-gray-500 truncate">{storefrontUrl}</p>
                  </div>
                  <button type="button" onClick={handleCopyLink} className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-secondary hover:bg-primary'}`}>
                      {isCopied ? <CheckCircleIcon /> : <ClipboardIcon />}
                      <span className="ml-2">{isCopied ? 'Disalin!' : 'Salin Link'}</span>
                  </button>
              </div>
          )}

          <div className="pt-5">
            <div className="flex justify-end items-center">
              {isSaved && <span className="text-green-600 mr-4 text-sm">Pengaturan disimpan!</span>}
              <button 
                type="submit" 
                disabled={!!slugError || !!phoneError}
                className="bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsView;
