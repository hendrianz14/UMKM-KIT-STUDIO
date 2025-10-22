import { notFound } from "next/navigation";

import { StorefrontContextProvider } from "@/contexts/StorefrontContext";
import { getStorefrontProductBySlug } from "@/lib/storefront-data";
import ProductDetailView from "@/components/ProductDetailView";

export const revalidate = 60;

interface ProductPageProps {
  params: {
    storeSlug: string;
    productSlug: string;
  };
}

export default async function StorefrontProductPage({ params }: ProductPageProps) {
  const result = await getStorefrontProductBySlug(params.storeSlug, params.productSlug);

  if (!result?.storefront || !result?.product) {
    notFound();
  }

  return (
    <StorefrontContextProvider
      initialStorefront={result.storefront}
      initialProducts={result.products}
      initialQuotes={[]}
      initialActiveProductId={result.product.id}
    >
      <ProductDetailView />
    </StorefrontContextProvider>
  );
}
