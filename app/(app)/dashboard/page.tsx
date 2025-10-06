import { getDashboardData } from "@/lib/data";
import DashboardClient from "@/components/dashboard-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const initialData = await getDashboardData();
  if (!initialData) {
    redirect("/sign-in");
  }
  return <DashboardClient initialData={initialData} />;
}
