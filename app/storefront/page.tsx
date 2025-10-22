import StorefrontAdminView from '@/components/storefront/admin/StorefrontAdminView';
import { StorefrontProvider } from '@/components/storefront/StorefrontProvider';
import { loadStorefrontForAdmin } from '@/app/storefront/actions';

interface StorefrontPageProps {
  searchParams?: { slug?: string };
}

export default async function StorefrontPage({
  searchParams,
}: StorefrontPageProps) {
  const payload = await loadStorefrontForAdmin(searchParams?.slug);

  if (!payload) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg bg-white p-10 text-center shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Storefront belum tersedia</h1>
          <p className="mt-2 text-gray-600">
            Belum ada data storefront di Supabase. Tambahkan baris pada tabel{' '}
            <code className="rounded bg-gray-100 px-2 py-1 text-sm">storefront_settings</code>{' '}
            untuk mulai menggunakan halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontProvider storefront={payload.storefront} products={payload.products}>
      <StorefrontAdminView />
    </StorefrontProvider>
  );
}
