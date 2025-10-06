import React from 'react';
import { getUser } from '@/lib/data';
import DashboardLayoutClient from '@/components/dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil data pengguna di server. Jika gagal, Anda bisa menangani error di sini.
  // Misalnya, mengalihkan ke halaman login jika tidak ada pengguna.
  const user = await getUser();

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
