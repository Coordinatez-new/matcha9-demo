import { MatchaView } from "@/components/views/MatchaView";
import { pageMetadata } from "@/lib/metadata";
import { getPublicMenu } from "@/server/menu";

export const metadata = pageMetadata({
  title: "Our Matcha",
  description:
    "Certified organic, ceremonial-grade Japanese matcha from the first spring harvest, whisked to order. What matcha is, why shade matters, and what goes into our wellness blends.",
});

export default async function MatchaPage() {
  const { items } = await getPublicMenu();
  return <MatchaView items={items} />;
}
