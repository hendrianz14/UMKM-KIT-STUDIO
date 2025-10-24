'use client';

import { useEffect, useState } from 'react';
import Toast from '../Toast';
import { useStorefront } from '../StorefrontProvider';
import {
  StorefrontSettings,
  StorefrontStatus,
} from '@/lib/storefront/types';
import { containsProfanity, slugify } from '@/lib/storefront/utils';
import ClipboardIcon from '../icons/ClipboardIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

const SettingsView = () => {
  const { storefront, updateStorefrontSettings } = useStorefront();
  const [formData, setFormData] = useState<StorefrontSettings>(storefront);
  const [phoneError, setPhoneError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(storefront.slug),
  );

  useEffect(() => {
    setFormData(storefront);
  }, [storefront]);

  const basePath = `/shop/${formData.slug}`;
  const [storefrontUrl, setStorefrontUrl] = useState(basePath);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setStorefrontUrl(basePath);
      return;
    }
    const origin = window.location.origin.replace(/\/$/, '');
    setStorefrontUrl(`${origin}${basePath}`);
  }, [basePath]);

  const validateSlug = (value: string) => {
    if (!value) return '';
    if (value.length < 3) {
      return 'URL Toko minimal harus 3 karakter.';
    }
    if (containsProfanity(value)) {
      return 'URL Toko mengandung kata yang tidak diizinkan.';
    }
    return '';
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'slug') {
      const slugged = slugify(value);
      setIsSlugManuallyEdited(slugged !== '');
      setSlugError(validateSlug(slugged));
      setFormData((prev) => ({ ...prev, slug: slugged }));
      return;
    }

    if (name === 'name') {
      setFormData((prev) => {
        const next: StorefrontSettings = { ...prev, name: value };
        if (!isSlugManuallyEdited) {
          const newSlug = slugify(value);
          setSlugError(validateSlug(newSlug));
          next.slug = newSlug;
        }
        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: StorefrontStatus) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (slugError) return;

    if (!formData.whatsappNumber.startsWith('62')) {
      setPhoneError('Nomor WhatsApp harus diawali dengan 62.');
      return;
    }

    setPhoneError('');
    try {
      await updateStorefrontSettings(formData);
      setIsSaved(true);
      setShowSavedToast(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Gagal menyimpan pengaturan';
      if (message === 'SLUG_TAKEN') {
        setSlugError('Slug sudah digunakan. Silakan pilih slug lain.');
        return;
      }
      if (message === 'STORE_NOT_FOUND') {
        alert('Storefront tidak ditemukan. Muat ulang halaman atau hubungi admin.');
        return;
      }
      // tampilkan error generik
      alert(`Gagal menyimpan pengaturan: ${message}`);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      void navigator.clipboard.writeText(storefrontUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isStoreActive =
    formData.status === StorefrontStatus.PUBLISHED ||
    formData.status === StorefrontStatus.UNLISTED;

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold text-primary">
        Pengaturan Storefront
      </h1>
      <p className="mb-8 text-md text-gray-600">
        Atur tampilan dan informasi dasar toko online Anda.
      </p>

      <div className="rounded-lg bg-white p-4 shadow-md sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nama Toko
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-secondary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Toko (Slug)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-secondary sm:text-sm ${slugError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="otomatis-dibuat-dari-nama-toko"
            />
            {slugError && (
              <p className="mt-2 text-sm text-red-600">{slugError}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              URL lengkap:{' '}
              <span className="font-semibold text-gray-700 break-all">
                {storefrontUrl}
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor="whatsappNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Nomor WhatsApp
            </label>
            <input
              type="text"
              name="whatsappNumber"
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-secondary sm:text-sm ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="contoh: 6281234567890"
            />
            {phoneError && (
              <p className="mt-2 text-sm text-red-600">{phoneError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="locationText"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat (Opsional)
            </label>
            <input
              type="text"
              name="locationText"
              id="locationText"
              value={formData.locationText ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-secondary sm:text-sm"
              placeholder="e.g. Jl. Merdeka No. 17, Bandung"
            />
          </div>

          <div>
            <label
              htmlFor="hoursText"
              className="block text-sm font-medium text-gray-700"
            >
              Jam Buka (Opsional)
            </label>
            <input
              type="text"
              name="hoursText"
              id="hoursText"
              value={formData.hoursText ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-secondary sm:text-sm"
              placeholder="e.g. Buka Setiap Hari, 09:00 - 20:00"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">
              Status Storefront
            </span>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  id="status_off"
                  type="radio"
                  checked={formData.status === StorefrontStatus.OFF}
                  onChange={() => handleStatusChange(StorefrontStatus.OFF)}
                  className="h-4 w-4 border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Off (Toko tidak dapat diakses publik)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  id="status_unlisted"
                  type="radio"
                  checked={formData.status === StorefrontStatus.UNLISTED}
                  onChange={() =>
                    handleStatusChange(StorefrontStatus.UNLISTED)
                  }
                  className="h-4 w-4 border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Unlisted (Hanya bisa diakses via link)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  id="status_published"
                  type="radio"
                  checked={formData.status === StorefrontStatus.PUBLISHED}
                  onChange={() =>
                    handleStatusChange(StorefrontStatus.PUBLISHED)
                  }
                  className="h-4 w-4 border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Published (Bisa diakses publik)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                Tampilkan Katalog Produk
              </span>
              <p className="text-xs text-gray-500">
                Jika ON, publik dapat melihat daftar produk Anda.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="isCatalogEnabled"
                checked={formData.isCatalogEnabled}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 transition-all peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-secondary after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:translate-x-0 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>

          {isStoreActive && (
            <div className="flex flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full overflow-hidden sm:w-auto">
                <span className="text-sm font-medium text-gray-900">
                  Link Katalog Anda
                </span>
                <p className="truncate text-sm text-gray-500">{storefrontUrl}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors sm:w-auto ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-secondary hover:bg-primary'}`}
              >
                {isCopied ? <CheckCircleIcon /> : <ClipboardIcon />}
                <span className="ml-2">{isCopied ? 'Disalin!' : 'Salin Link'}</span>
              </button>
            </div>
          )}

      <div className="pt-5">
        <div className="flex items-center justify-end">
          {isSaved && (
            <span className="mr-4 text-sm text-green-600">
              Pengaturan disimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={Boolean(slugError) || Boolean(phoneError)}
            className="rounded-lg bg-secondary px-4 py-2 font-bold text-white shadow-md transition duration-300 hover:bg-primary disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
      {showSavedToast && (
        <Toast
          message="Pengaturan disimpan!"
          onClose={() => setShowSavedToast(false)}
        />
      )}
        </form>
      </div>
    </>
  );
};

export default SettingsView;
