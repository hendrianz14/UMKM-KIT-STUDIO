import React from "react";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboard-layout-client";
import { getDashboardData } from "@/lib/data";
import { AppContextProvider } from "@/contexts/AppContext";
import { ensureStorefrontForUser } from "@/lib/storefront-data";
import { StorefrontProvider } from "@/contexts/StorefrontContext";

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

  const storefrontData = await ensureStorefrontForUser(dashboardData.user);

  if (!storefrontData) {
    throw new Error("Gagal memuat data storefront.");
  }

  return (
    <AppContextProvider initialData={dashboardData}>
      <StorefrontProvider
        initialProducts={storefrontData.products}
        initialSettings={storefrontData.settings}
      >
        <DashboardLayoutClient user={dashboardData.user}>
          {children}
        </DashboardLayoutClient>
      </StorefrontProvider>
    </AppContextProvider>
  );
}
