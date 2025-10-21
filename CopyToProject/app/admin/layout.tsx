import React from 'react';
import AdminLayoutClient from '@/views/admin/AdminLayoutClient';
import { getStoreSettingsBySlug } from '@/lib/data';

// Ganti 'toko-saya' dengan cara Anda mengidentifikasi toko yang sedang login
const ADMIN_STORE_SLUG = 'toko-saya';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storefrontSettings = await getStoreSettingsBySlug(ADMIN_STORE_SLUG);

  if (!storefrontSettings) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Pengaturan toko tidak ditemukan.</p>
        </div>
    );
  }

  return (
    <html lang="en">
      <body className="bg-light font-sans text-gray-800">
        <AdminLayoutClient settings={storefrontSettings}>
            {children}
        </AdminLayoutClient>
      </body>
    </html>
  );
}