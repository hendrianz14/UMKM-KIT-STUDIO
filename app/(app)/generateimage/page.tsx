import GenerateImagePage from "@/components/GenerateImagePage";
import { AppProvider } from "@/contexts/AppContext";
import { getDashboardData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function Page() {
  const initialData = await getDashboardData();

  if (!initialData) {
    redirect("/sign-in");
  }
  return (
    <AppProvider initialData={initialData}>
      <GenerateImagePage />
    </AppProvider>
  );
}
