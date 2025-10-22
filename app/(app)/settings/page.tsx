import ApiKeyUser from "@/components/ApiKeyUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SettingsRoute() {
  return <ApiKeyUser />;
import SettingsPage from '@/components/SettingsPage';

export default function Page() {
  return <SettingsPage />;
}
