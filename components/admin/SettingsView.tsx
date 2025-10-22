'use client';

import React, { useEffect, useState } from 'react';
import { useStorefrontContext } from '@/contexts/StorefrontContext';
import type { StorefrontUpdatePayload } from '@/types/storefront.types';

const SettingsView: React.FC = () => {
  const { storefront, updateStorefront, isMutating } = useStorefrontContext();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [locationText, setLocationText] = useState('');
  const [hoursText, setHoursText] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroCtaLabel, setHeroCtaLabel] = useState('');
  const [heroCtaLink, setHeroCtaLink] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0D47A1');
  const [accentColor, setAccentColor] = useState('#FFC107');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!storefront) {
      return;
    }
    const theme = storefront.theme ?? {};
    setName(storefront.name);
    setSlug(storefront.slug);
    setWhatsappNumber(storefront.whatsappNumber ?? '');
    setLocationText(storefront.locationText ?? '');
    setHoursText(storefront.hoursText ?? '');
    setHeroHeadline((theme.heroHeadline as string) ?? '');
    setHeroSubheadline((theme.heroSubheadline as string) ?? '');
    setHeroCtaLabel((theme.heroCtaLabel as string) ?? '');
    setHeroCtaLink((theme.heroCtaLink as string) ?? '');
    setPrimaryColor((theme.primaryColor as string) ?? '#0D47A1');
    setAccentColor((theme.accentColor as string) ?? '#FFC107');
  }, [storefront]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storefront) {
      return;
    }

    const payload: StorefrontUpdatePayload = {
      name: name.trim(),
      slug: slug.trim(),
      whatsappNumber: whatsappNumber.trim(),
      locationText: locationText.trim() || null,
      hoursText: hoursText.trim() || null,
      theme: {
        heroHeadline: heroHeadline.trim() || undefined,
        heroSubheadline: heroSubheadline.trim() || undefined,
        heroCtaLabel: heroCtaLabel.trim() || undefined,
        heroCtaLink: heroCtaLink.trim() || undefined,
        primaryColor,
        accentColor,
      },
    };

    try {
      await updateStorefront(payload);
      setMessage('Perubahan berhasil disimpan.');
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Gagal menyimpan pengaturan.';
      setMessage(errMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
    >
      <header>
        <h2 className="text-lg font-semibold text-primary">Brand & Tampilan Storefront</h2>
        <p className="mt-2 text-sm text-blue-400">
          Perbarui nama toko, slug, kontak WhatsApp, dan identitas visual. Perubahan akan terlihat di halaman publik.
        </p>
      </header>

      {message ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="store-name" className="text-sm font-semibold text-primary">
            Nama Toko
          </label>
          <input
            id="store-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="KitStudio Merch"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="store-slug" className="text-sm font-semibold text-primary">
            Slug (URL)
          </label>
          <input
            id="store-slug"
            type="text"
            required
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="kitstudio-merch"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="store-whatsapp" className="text-sm font-semibold text-primary">
            Nomor WhatsApp
          </label>
          <input
            id="store-whatsapp"
            type="text"
            required
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="62812xxxxxxxx"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="store-location" className="text-sm font-semibold text-primary">
            Lokasi (opsional)
          </label>
          <input
            id="store-location"
            type="text"
            value={locationText}
            onChange={(event) => setLocationText(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Jl. Contoh No. 123, Jakarta"
          />
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="store-hours" className="text-sm font-semibold text-primary">
          Jam Operasional (opsional)
        </label>
        <textarea
          id="store-hours"
          rows={3}
          value={hoursText}
          onChange={(event) => setHoursText(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder={'Senin - Jumat: 09.00 - 17.00\nSabtu: 09.00 - 15.00'}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="primary-color" className="text-sm font-semibold text-primary">
            Warna Utama
          </label>
          <input
            id="primary-color"
            type="color"
            value={primaryColor}
            onChange={(event) => setPrimaryColor(event.target.value)}
            className="h-12 w-full rounded-xl border border-blue-100 bg-blue-50/40"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="accent-color" className="text-sm font-semibold text-primary">
            Warna Aksen
          </label>
          <input
            id="accent-color"
            type="color"
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            className="h-12 w-full rounded-xl border border-blue-100 bg-blue-50/40"
          />
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="hero-headline" className="text-sm font-semibold text-primary">
          Judul Hero
        </label>
        <input
          id="hero-headline"
          type="text"
          value={heroHeadline}
          onChange={(event) => setHeroHeadline(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Tingkatkan penjualan produk Anda"
        />
        <label htmlFor="hero-subheadline" className="text-sm font-semibold text-primary">
          Subjudul Hero
        </label>
        <input
          id="hero-subheadline"
          type="text"
          value={heroSubheadline}
          onChange={(event) => setHeroSubheadline(event.target.value)}
          className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Lengkapi katalog Anda dengan konten AI profesional."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="hero-cta-label" className="text-sm font-semibold text-primary">
            Teks Tombol CTA
          </label>
          <input
            id="hero-cta-label"
            type="text"
            value={heroCtaLabel}
            onChange={(event) => setHeroCtaLabel(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Minta Penawaran"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="hero-cta-link" className="text-sm font-semibold text-primary">
            Link CTA
          </label>
          <input
            id="hero-cta-link"
            type="text"
            value={heroCtaLink}
            onChange={(event) => setHeroCtaLink(event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="#quote"
          />
        </div>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-blue-200"
          disabled={isMutating}
        >
          {isMutating ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        <button
          type="button"
          onClick={() => setMessage(null)}
          className="inline-flex items-center justify-center rounded-xl border border-blue-100 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-blue-50/50"
        >
          Reset Pesan
        </button>
      </div>
    </form>
  );
};

export default SettingsView;
