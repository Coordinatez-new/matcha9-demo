import { CommunitySection } from "@/components/home/CommunitySection";
import { Hero } from "@/components/home/Hero";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { MenuPreview } from "@/components/home/MenuPreview";
import { RitualSection } from "@/components/home/RitualSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { StandardSection } from "@/components/home/StandardSection";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { VisitSection } from "@/components/home/VisitSection";
import { WellnessBlends } from "@/components/home/WellnessBlends";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { Marquee } from "@/components/ui/Marquee";
import { hoursLine } from "@/lib/settings";
import { site } from "@/lib/site";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";

export default async function Home() {
  const [{ items }, settings] = await Promise.all([getPublicMenu(), getSettings()]);
  return (
    <>
      <LocalBusinessJsonLd />
      <Hero />
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
      <VisitSection hours={hoursLine(settings.store.hours)} />
      <ShopTeaser />
      <InstagramStrip />
    </>
  );
}
