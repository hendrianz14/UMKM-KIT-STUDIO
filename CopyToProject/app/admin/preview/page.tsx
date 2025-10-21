import React from 'react';
import StorePreviewView from '@/views/admin/StorePreviewView';
import { getStoreSettingsBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';

const ADMIN_STORE_SLUG = 'toko-saya';

export default async function AdminStorePreviewPage() {
  const settings = await getStoreSettingsBySlug(ADMIN_STORE_SLUG);

  if (!settings) {
    notFound();
  }

  return <StorePreviewView settings={settings} />;
}