import { VisitView } from "@/components/views/VisitView";
import { pageMetadata } from "@/lib/metadata";
import { hoursLine } from "@/lib/settings";
import { getSettings } from "@/server/settings";

export const metadata = pageMetadata({
  title: "Visit",
  description:
    "Matcha 9 is the matcha counter inside Taco Maya, 2529 N Milwaukee Ave, Ste B, Logan Square, Chicago. Directions, hours, phone and pickup ordering.",
});

export default async function VisitPage() {
  const settings = await getSettings();
  return <VisitView hours={hoursLine(settings.store.hours)} hoursNote={settings.store.hoursNote} />;
}
