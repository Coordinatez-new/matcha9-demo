import Image from "next/image";
import Link from "next/link";
import { formatMoney, menuNumber, type MenuItem } from "@/lib/menu";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { imageSrc } from "@/lib/paths";

// A few real ingredients from each blend's full list, picked for recognition.
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

/** Curated chips for the known blends; the first few listed ingredients for any new one. */
function chipsFor(item: MenuItem) {
  if (highlights[item.slug]) return highlights[item.slug]!;
  const first = item.ingredients?.groups[0]?.items ?? "";
  return first
    .replace(/\.$/, "")
    .split(/,\s*|\s+and\s+/)
    .filter(Boolean)
    .slice(0, 7)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

function BlendCard({ item, index }: { item: MenuItem; index: number }) {
  const href = `/menu/${item.slug}`;
  const photo = item.photoImage ?? item.productImage;
  return (
    <article className="group grid overflow-hidden rounded-lg bg-paper sm:grid-cols-2">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden sm:aspect-auto"
        tabIndex={-1}
        aria-hidden="true"
      >
        {photo && (
          <Image
            src={imageSrc(photo.src)}
            alt=""
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.4s] ease-calm group-hover:scale-[1.035]"
          />
        )}
      </Link>
      <div className="flex flex-col p-8 md:p-10">
        <p className="eyebrow text-sage-deep">
          {menuNumber(index)} · {formatMoney(item.priceCents)}
        </p>
        <h3 className="mt-4 font-display text-4xl text-moss">
          <Link href={href}>{item.name}</Link>
        </h3>
        <p className="mt-4 leading-relaxed text-ink-soft">{item.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Some of what’s inside">
          {chipsFor(item).map((h) => (
            <li key={h} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
              {h}
            </li>
          ))}
        </ul>
        <ArrowLink href={href} className="mt-auto pt-10 text-moss">
          See every ingredient
        </ArrowLink>
      </div>
    </article>
  );
}

/** The drinks that publish a full ingredient list (the wellness blends). */
export function WellnessBlends({ items }: { items: MenuItem[] }) {
  const blends = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.ingredients)
    .slice(0, 2);
  if (blends.length === 0) return null;

  return (
    <section className="py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="Wellness blends"
            jp="滋養"
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
          {blends.map(({ item, index }, i) => (
            <Reveal key={item.id} delay={i * 120}>
              <BlendCard item={item} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
