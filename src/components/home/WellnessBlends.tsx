import Image from "next/image";
import Link from "next/link";
import { drinkNumber, formatPrice, getDrink, type Drink } from "@/content/drinks";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

// A few real ingredients from each blend's full list (see content/drinks.ts).
const highlights: Record<string, string[]> = {
  "very-berry": [
    "Blueberry",
    "Raspberry",
    "Strawberry",
    "Acai",
    "Pomegranate",
    "Goji",
    "Ashwagandha",
  ],
  "green-glow": [
    "Spirulina",
    "Chlorella",
    "Wheat grass",
    "Kale",
    "Lion’s mane",
    "Reishi",
    "Probiotics",
  ],
};

function BlendCard({ drink }: { drink: Drink }) {
  return (
    <article className="group grid overflow-hidden rounded-lg bg-paper sm:grid-cols-2">
      <Link
        href={`/menu/${drink.slug}/`}
        className="relative block aspect-[4/5] overflow-hidden sm:aspect-auto"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={drink.photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.4s] ease-calm group-hover:scale-[1.035]"
        />
      </Link>
      <div className="flex flex-col p-8 md:p-10">
        <p className="eyebrow text-sage-deep">
          {drinkNumber(drink.no)} · {formatPrice(drink.price)}
        </p>
        <h3 className="mt-4 font-display text-4xl text-moss">
          <Link href={`/menu/${drink.slug}/`}>{drink.name}</Link>
        </h3>
        <p className="mt-4 leading-relaxed text-ink-soft">{drink.intro}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Some of what’s inside">
          {highlights[drink.slug]?.map((h) => (
            <li key={h} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
              {h}
            </li>
          ))}
        </ul>
        <ArrowLink href={`/menu/${drink.slug}/`} className="mt-auto pt-10 text-moss">
          See every ingredient
        </ArrowLink>
      </div>
    </article>
  );
}

export function WellnessBlends() {
  const blends = ["very-berry", "green-glow"]
    .map((s) => getDrink(s))
    .filter((d): d is Drink => !!d);
  return (
    <section className="py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="Wellness blends"
            title={
              <>
                Whole-food blends, <em>carried by matcha.</em>
              </>
            }
          >
            The two drinks with a QR code on our printed menu. Scan it at the bar, or read every
            ingredient here. All of it certified organic.
          </SectionHeader>
        </Reveal>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {blends.map((drink, i) => (
            <Reveal key={drink.slug} delay={i * 120}>
              <BlendCard drink={drink} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
