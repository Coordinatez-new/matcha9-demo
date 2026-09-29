import { drinks } from "@/content/drinks";
import { DrinkCard } from "@/components/menu/DrinkCard";
import { CarouselItem, DrinkCarousel } from "@/components/menu/DrinkCarousel";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function MenuPreview() {
  return (
    <section className="overflow-hidden bg-sand py-24 md:py-32">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            index="02"
            eyebrow="The menu"
            title={
              <>
                Nine drinks, <em>one standard.</em>
              </>
            }
          >
            From a pure, unsweetened classic to layered creations you’ll want to photograph first.
            Every one starts with the same matcha.
          </SectionHeader>
          <ArrowLink href="/menu/" className="text-moss">
            See the full menu
          </ArrowLink>
        </Reveal>

        <Reveal className="mt-14" delay={120}>
          <DrinkCarousel label="Signature drinks">
            {drinks.map((drink) => (
              <CarouselItem key={drink.slug}>
                <DrinkCard drink={drink} />
              </CarouselItem>
            ))}
          </DrinkCarousel>
        </Reveal>
      </div>
    </section>
  );
}
