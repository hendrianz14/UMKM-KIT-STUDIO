import React from 'react';
import OverviewView from '@/views/admin/OverviewView';
import { getAllProductsByStoreId, getStoreSettingsBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';

// Ganti 'store-id-placeholder' dengan ID toko yang sedang aktif/login
const STORE_ID = 'store-id-placeholder';
const ADMIN_STORE_SLUG = 'toko-saya';

export default async function AdminOverviewPage() {
  const products = await getAllProductsByStoreId(STORE_ID);
  // Fix: Fetch settings on the server and pass them as props.
  const settings = await getStoreSettingsBySlug(ADMIN_STORE_SLUG);

  if (!settings) {
    notFound();
  }

  return <OverviewView initialProducts={products} storefrontSettings={settings} />;
}
