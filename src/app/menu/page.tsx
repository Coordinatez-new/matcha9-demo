import { pageMetadata } from "@/lib/metadata";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { OrderBand } from "@/components/ui/OrderBand";
import { PageIntro } from "@/components/ui/PageIntro";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Menu",
  description:
    "Nine signature matcha drinks from $5: Simply Matcha, Very Berry, Green Glow, Coco Chill, Pistachio Drip, Mango Magic, Cinnamon Matcha Melt, Cookie Crave and Matchamisu.",
});

export default function MenuPage() {
  return (
    <>
      <PageIntro
        eyebrow="The menu"
        title={
          <>
            Nine drinks, <em className="font-normal text-sage-deep">one standard.</em>
          </>
        }
      >
        From a pure, unsweetened classic to layered creations you’ll want to photograph first. Every
        one starts with the same organic, ceremonial-grade Japanese matcha, whisked to order.
      </PageIntro>

      <section className="container-page pb-24 md:pb-32">
        <div className="mb-12 grid gap-6 border-y border-line py-7 text-sm md:grid-cols-3">
          <p>
            <span className="block eyebrow text-sage-deep">Ways to order</span>
            <span className="mt-2 block text-ink">Hot or iced · Milk, water or coconut water</span>
          </p>
          <p>
            <span className="block eyebrow text-sage-deep">In every cup</span>
            <span className="mt-2 block text-ink">
              Certified organic, ceremonial-grade Japanese matcha
            </span>
          </p>
          <p>
            <span className="block eyebrow text-sage-deep">Our flagship</span>
            <span className="mt-2 block text-ink">Zero additives, fillers or added sugar</span>
          </p>
        </div>

        <MenuGrid />

        <p className="mt-20 max-w-2xl text-sm leading-relaxed text-ink-soft">{site.allergyNote}</p>
      </section>

      <OrderBand />
    </>
  );
}
