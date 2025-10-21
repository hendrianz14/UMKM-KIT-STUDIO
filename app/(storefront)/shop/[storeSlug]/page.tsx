import type { Metadata } from "next";
import StorefrontPublicShell from "@/components/StorefrontPublicShell";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { getStorefrontBySlug } from "@/lib/storefront-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { storeSlug: string };
}): Promise<Metadata> {
  const storefront = await getStorefrontBySlug(params.storeSlug);

  if (!storefront) {
    return {};
  }

  return {
    title: `${storefront.settings.name} • Katalog Produk`,
    description:
      storefront.settings.locationText ??
      `Katalog produk dari ${storefront.settings.name}.`,
  };
}

export default async function StorefrontPublicPage({
  params,
}: {
  params: { storeSlug: string };
}) {
  const storefront = await getStorefrontBySlug(params.storeSlug);

  if (!storefront) {
    notFound();
  }

  const { settings, products } = storefront;

  return (
    <StorefrontProvider initialSettings={settings} initialProducts={products}>
      <StorefrontPublicShell
        storeSlug={params.storeSlug}
        settings={settings}
        products={products}
      />
    </StorefrontProvider>
  );
}
