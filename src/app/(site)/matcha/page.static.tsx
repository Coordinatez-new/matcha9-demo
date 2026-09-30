import { DemoMatcha } from "@/demo/pages/storefront";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Our Matcha",
  description:
    "Certified organic, ceremonial-grade Japanese matcha from the first spring harvest, whisked to order. What matcha is, why shade matters, and what goes into our wellness blends.",
});

export default function MatchaPage() {
  return <DemoMatcha />;
}
