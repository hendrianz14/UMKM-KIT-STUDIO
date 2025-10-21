import type { Metadata } from "next";
import StorefrontProductShell from "@/components/StorefrontProductShell";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import {
  getProductBySlug,
  getStorefrontBySlug,
} from "@/lib/storefront-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { storeSlug: string; productSlug: string };
}): Promise<Metadata> {
  const storefront = await getStorefrontBySlug(params.storeSlug);

  if (!storefront) {
    return {};
  }

  const product = await getProductBySlug(
    storefront.settings.id,
    params.productSlug,
  );

  if (!product) {
    return {};
  }

  const title = `${product.name} • ${storefront.settings.name}`;
  const description =
    product.shortDescription ||
    storefront.settings.locationText ||
    title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images.length
        ? product.images.map((img) => ({
            url: img.url,
            alt: img.altText || product.name,
          }))
        : undefined,
    },
  };
}

export default async function StorefrontProductPage({
  params,
}: {
  params: { storeSlug: string; productSlug: string };
}) {
  const storefront = await getStorefrontBySlug(params.storeSlug);

  if (!storefront) {
    notFound();
  }

  const product = await getProductBySlug(
    storefront.settings.id,
    params.productSlug,
  );

  if (!product) {
    notFound();
  }

  return (
    <StorefrontProvider
      initialSettings={storefront.settings}
      initialProducts={storefront.products}
    >
      <StorefrontProductShell
        storeSlug={params.storeSlug}
        productSlug={params.productSlug}
        settings={storefront.settings}
        products={storefront.products}
        product={product}
      />
    </StorefrontProvider>
  );
}
