import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import tools from "@/assets/craft/tools-on-counter.webp";
import flatlayStation from "@/assets/craft/flatlay-station.webp";
import flatlayPrep from "@/assets/craft/flatlay-prep.webp";
import greenGlowPoster from "@/assets/features/green-glow-ingredients.webp";
import veryBerryPoster from "@/assets/features/very-berry-fruits.webp";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutMatcha, standards, tools as toolList } from "@/content/matcha";
import { formatMoney } from "@/lib/menu";
import { getPublicMenu } from "@/server/menu";

export const metadata = pageMetadata({
  title: "Our Matcha",
  description:
    "Certified organic, ceremonial-grade Japanese matcha from the first spring harvest, whisked to order. What matcha is, why shade matters, and what goes into our wellness blends.",
});

const blends = [
  {
    slug: "green-glow",
    poster: greenGlowPoster,
    alt: "Green Glow Matcha poster showing chlorella, wheatgrass, lion’s mane, reishi, spirulina and organic matcha",
  },
  {
    slug: "very-berry",
    poster: veryBerryPoster,
    alt: "Very Berry Matcha poster surrounded by the fruits in its whole-food blend",
  },
];

export default async function MatchaPage() {
  const { items } = await getPublicMenu();
  return (
    <>
      <PageIntro
        eyebrow="Our matcha"
        title={
          <>
            The part most places{" "}
            <em className="font-normal text-sage-deep">don’t bother explaining.</em>
          </>
        }
      >
        Certified organic, ceremonial-grade Japanese matcha from the first spring harvest, whisked
        to order. Here’s what that actually means, and why it tastes the way it does.
      </PageIntro>

      <section className="container-page pb-24 md:pb-32">
        <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {standards.map((s, i) => (
            <li key={s.title} className="bg-cream p-8 md:p-10">
              <Reveal delay={i * 80}>
                <span className="font-display text-sm text-sage italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-6 font-display text-3xl text-moss">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-24 md:py-32">
        <div className="container-page grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-32">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-sand">
                <Image
                  src={tools}
                  alt="Bamboo whisk, stoneware matcha bowl, sifter and scoop on the Matcha 9 counter"
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <SectionHeader
                eyebrow="About matcha"
                title={
                  <>
                    Six things worth <em>knowing.</em>
                  </>
                }
              >
                Straight from the notes behind the QR codes on our menu.
              </SectionHeader>
            </Reveal>
            <Reveal className="mt-12" delay={100}>
              <Accordion items={aboutMatcha} defaultOpen={0} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-sand py-24 md:py-32">
        <div className="container-page grid gap-16 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <SectionHeader
              eyebrow="The tools of the ritual"
              title={
                <>
                  Whisked by hand, <em>every time.</em>
                </>
              }
            >
              Every drink starts at the bowl before anything else goes in the glass.
            </SectionHeader>
            <dl className="mt-12 border-t border-moss/15">
              {toolList.map((t) => (
                <div
                  key={t.name}
                  className="grid gap-2 border-b border-moss/15 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="font-display text-2xl text-moss">{t.name}</dt>
                  <dd className="leading-relaxed text-ink-soft">{t.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4 lg:col-span-5 lg:col-start-8" delay={120}>
            <div className="relative mt-16 aspect-[9/16] overflow-hidden rounded-lg">
              <Image
                src={flatlayStation}
                alt="Top-down view of the matcha station: whisk, sifter, scoop and scale on a bamboo board"
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[9/16] overflow-hidden rounded-lg">
              <Image
                src={flatlayPrep}
                alt="Freshly whisked matcha on the scale beside a finished drink dusted with matcha"
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="Wellness blends"
              title={
                <>
                  Two blends, <em>every ingredient listed.</em>
                </>
              }
            >
              Our flagship stays pure. These two pair the same matcha with certified organic
              whole-food blends, and we publish the full list for both.
            </SectionHeader>
          </Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {blends.map((b, i) => {
              const drink = items.find((i) => i.slug === b.slug);
              if (!drink) return null;
              return (
                <Reveal key={b.slug} delay={i * 120}>
                  <Link href={`/menu/${drink.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                      <Image
                        src={b.poster}
                        alt={b.alt}
                        fill
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="object-cover transition-transform duration-[1.4s] ease-calm group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-6 flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-3xl text-moss">{drink.name}</h3>
                      <span className="font-display text-xl text-ink-soft">
                        {formatMoney(drink.priceCents)}
                      </span>
                    </div>
                    <p className="mt-2 max-w-md leading-relaxed text-ink-soft">
                      {drink.ingredients?.lede}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/menu">Explore the full menu</ButtonLink>
            <ArrowLink href="/story" className="text-moss">
              Why we chose matcha
            </ArrowLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
