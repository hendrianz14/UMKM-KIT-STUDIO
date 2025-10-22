import { notFound } from 'next/navigation';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import StorefrontCatalog from '@/components/storefront/StorefrontCatalog';
import { fetchStorefrontBySlug } from '@/lib/storefront/queries';

interface StorefrontPageProps {
  params: { storeSlug: string };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const payload = await fetchStorefrontBySlug(params.storeSlug);

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
