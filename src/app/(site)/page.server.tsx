import { HomeView } from "@/components/views/HomeView";
import { hoursLine } from "@/lib/settings";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";

export default async function Home() {
  const [{ items }, settings] = await Promise.all([getPublicMenu(), getSettings()]);
  return <HomeView items={items} hours={hoursLine(settings.store.hours)} />;
}
