import { notFound } from 'next/navigation';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import StorefrontProductDetail from '@/components/storefront/StorefrontProductDetail';
import { fetchStorefrontProductBySlug } from '@/lib/storefront/queries';

interface ProductPageProps {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}

export default async function StorefrontProductPage({
  params,
}: ProductPageProps) {
  const { storeSlug, productSlug } = await params;
  const result = await fetchStorefrontProductBySlug(storeSlug, productSlug);

  if (!result) {
    notFound();
  }

  const { payload, product } = result;

  return (
    <StorefrontShell
      storefront={payload.storefront}
      products={payload.products}
    >
      <StorefrontProductDetail storeSlug={payload.storefront.slug} product={product} />
    </StorefrontShell>
  );
}
