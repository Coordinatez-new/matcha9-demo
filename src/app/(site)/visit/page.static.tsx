import { DemoVisit } from "@/demo/pages/storefront";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Visit",
  description:
    "Matcha 9 is the matcha counter inside Taco Maya, 2529 N Milwaukee Ave, Ste B, Logan Square, Chicago. Directions, hours, phone and pickup ordering.",
});

export default function VisitPage() {
  return <DemoVisit />;
}
