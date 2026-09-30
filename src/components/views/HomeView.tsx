import { CommunitySection } from "@/components/home/CommunitySection";
import { DrinkBuildHero } from "@/components/home/DrinkBuildHero";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { MenuPreview } from "@/components/home/MenuPreview";
import { RitualSection } from "@/components/home/RitualSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { StandardSection } from "@/components/home/StandardSection";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { VisitSection } from "@/components/home/VisitSection";
import { Welcome } from "@/components/home/Welcome";
import { WellnessBlends } from "@/components/home/WellnessBlends";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { Marquee } from "@/components/ui/Marquee";
import type { MenuItem } from "@/lib/menu";
import { site } from "@/lib/site";

/** The home page. */
export function HomeView({ items, hours }: { items: MenuItem[]; hours: string }) {
  return (
    <>
      <LocalBusinessJsonLd />
      <DrinkBuildHero items={items} />
      <Welcome />
      <Marquee
        items={[
          site.motto,
          "Certified organic",
          "Ceremonial grade",
          "Whisked to order",
          site.values.join(" · "),
          "Logan Square, Chicago",
        ]}
      />
      <StandardSection />
      <MenuPreview items={items} />
      <WellnessBlends items={items} />
      <RitualSection />
      <StoryTeaser />
      <CommunitySection />
      <VisitSection hours={hours} />
      <ShopTeaser />
      <InstagramStrip />
    </>
  );
}
