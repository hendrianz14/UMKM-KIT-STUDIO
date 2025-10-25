import { notFound } from 'next/navigation';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import StorefrontCatalog from '@/components/storefront/StorefrontCatalog';
import { fetchStorefrontBySlug } from '@/lib/storefront/queries';

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug } = await params;
  const payload = await fetchStorefrontBySlug(storeSlug);

  if (!payload) {
    notFound();
  }

  return (
    <StorefrontShell
      storefront={payload.storefront}
      products={payload.products}
    >
      <StorefrontCatalog storeSlug={payload.storefront.slug} />
    </StorefrontShell>
  );
}
