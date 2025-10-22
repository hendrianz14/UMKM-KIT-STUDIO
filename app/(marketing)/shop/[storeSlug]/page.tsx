import { notFound } from "next/navigation";

import { StorefrontContextProvider } from "@/contexts/StorefrontContext";
import { getStorefrontPublicData } from "@/lib/storefront-data";
import PublicView from "@/components/PublicView";

export const revalidate = 60;

interface StorePageProps {
  params: {
    storeSlug: string;
  };
}

export default async function StorefrontPublicPage({ params }: StorePageProps) {
  const data = await getStorefrontPublicData(params.storeSlug);

  if (!data?.storefront) {
    notFound();
  }

  return (
    <StorefrontContextProvider
      initialStorefront={data.storefront}
      initialProducts={data.products}
      initialQuotes={[]}
    >
      <PublicView />
    </StorefrontContextProvider>
  );
}

