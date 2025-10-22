import { notFound } from 'next/navigation';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import StorefrontProductDetail from '@/components/storefront/StorefrontProductDetail';
import { fetchStorefrontProductBySlug } from '@/lib/storefront/queries';

interface ProductPageProps {
  params: { storeSlug: string; productSlug: string };
}

export default async function StorefrontProductPage({
  params,
}: ProductPageProps) {
  const result = await fetchStorefrontProductBySlug(
    params.storeSlug,
    params.productSlug,
  );

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
