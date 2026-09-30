import { starterItems } from "@/content/menu";
import { DemoMenu } from "@/demo/pages/menu";
import { menuDescription } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Menu",
  description: menuDescription(starterItems()),
});

export default function MenuPage() {
  return <DemoMenu />;
}
