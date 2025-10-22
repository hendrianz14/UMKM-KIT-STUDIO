import React from "react";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboard-layout-client";
import { getDashboardData } from "@/lib/data";
import { AppContextProvider } from "@/contexts/AppContext";
import { StorefrontContextProvider } from "@/contexts/StorefrontContext";
import { getStorefrontDashboardData } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardData = await getDashboardData();

  if (!dashboardData) {
    redirect("/sign-in");
  }

  const storefrontData = await getStorefrontDashboardData(dashboardData.user);

  return (
    <AppContextProvider initialData={dashboardData}>
      <StorefrontContextProvider
        initialStorefront={storefrontData.storefront}
        initialProducts={storefrontData.products}
        initialQuotes={storefrontData.quotes}
      >
        <DashboardLayoutClient user={dashboardData.user}>{children}</DashboardLayoutClient>
      </StorefrontContextProvider>
    </AppContextProvider>
  );
}
