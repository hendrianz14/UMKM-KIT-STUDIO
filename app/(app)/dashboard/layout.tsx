import React from "react";
import { getAppData } from "@/lib/data";
import DashboardLayoutClient from "@/components/dashboard-layout-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAppData().catch(() => null);

  if (!data) {
    redirect("/sign-in");
  }

  return <DashboardLayoutClient user={data.user}>{children}</DashboardLayoutClient>;
}
