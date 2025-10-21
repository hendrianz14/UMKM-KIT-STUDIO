import React from 'react';
import SettingsView from '@/views/admin/SettingsView';
import { getStoreSettingsBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';

const ADMIN_STORE_SLUG = 'toko-saya';

export default async function AdminSettingsPage() {
  const settings = await getStoreSettingsBySlug(ADMIN_STORE_SLUG);

  if (!settings) {
    notFound();
  }

  return <SettingsView initialSettings={settings} />;
}