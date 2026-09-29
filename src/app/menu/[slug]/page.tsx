import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DrinkCard } from "@/components/menu/DrinkCard";
import { DrinkGallery } from "@/components/menu/DrinkGallery";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutMatcha } from "@/content/matcha";
import { categories, drinkNumber, drinks, formatPrice, getDrink } from "@/content/drinks";
import { pageMetadata } from "@/lib/metadata";
import { site, siteOrigin } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return drinks.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const drink = getDrink(slug);
  if (!drink) return {};
  const description = `${drink.name}, ${formatPrice(drink.price)}: ${drink.components.join(" · ")}. ${drink.tagline}`;
  return pageMetadata({
    title: drink.name,
    description,
    images: [
      {
        url: `${siteOrigin}${drink.product.src}`,
        width: drink.product.width,
        height: drink.product.height,
        alt: drink.productAlt,
      },
    ],
  });
}

const matchaFaqs = aboutMatcha.filter((f) =>
  ["What matcha actually is", "First harvest", "Caffeine, and why it feels different"].includes(
    f.q,
  ),
);

export default async function DrinkPage(props: PageProps<"/menu/[slug]">) {
  const { slug } = await props.params;
  const drink = getDrink(slug);
  if (!drink) notFound();

  const index = drinks.findIndex((d) => d.slug === drink.slug);
  const related = [1, 2, 3].map((n) => drinks[(index + n) % drinks.length]!);
  const category = categories.find((c) => c.id === drink.category)?.label;

  return (
    <>
      <nav aria-label="Breadcrumb" className="container-page pt-8">
        <ol className="flex items-center gap-2 text-sm text-ink-soft">
          <li>
            <Link href="/menu/" className="transition-colors hover:text-moss">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="text-moss">
            {drink.name}
          </li>
        </ol>
      </nav>

      <section className="container-page grid gap-14 pt-8 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-6">
          <DrinkGallery
            shots={[
              { src: drink.product, alt: drink.productAlt, label: "Studio shot", kind: "product" },
              { src: drink.photo, alt: drink.photoAlt, label: "At the bar", kind: "photo" },
            ]}
          />
        </div>

        <div className="animate-rise [animation-delay:120ms] lg:col-span-5 lg:col-start-8 lg:pt-4">
          <p className="flex flex-wrap items-center gap-3 eyebrow text-sage-deep">
            {drinkNumber(drink.no)}
            <span className="h-px w-6 bg-line" aria-hidden="true" />
            {category}
            {drink.badge && (
              <span className="rounded-full border border-moss/15 px-2.5 py-0.5 text-[0.6rem] text-moss">
                {drink.badge}
              </span>
            )}
          </p>
          <h1 className="mt-5 text-display-lg">{drink.name}</h1>
          <p className="mt-4 font-display text-3xl text-ink-soft">{formatPrice(drink.price)}</p>
          <p className="mt-8 text-lg leading-relaxed text-ink-soft">{drink.intro}</p>

          <div className="mt-10 border-t border-line pt-7">
            <h2 className="eyebrow font-sans text-sage-deep">In the glass</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {drink.components.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-moss"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={drink.orderUrl} external>
              Order pickup
            </ButtonLink>
            <ButtonLink href="/visit/" variant="outline">
              Visit the bar
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-ink-soft">{site.rewards}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">{site.allergyNote}</p>
        </div>
      </section>

      {drink.ingredients && (
        <section className="bg-sand py-24 md:py-32">
          <div className="container-page grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <SectionHeader
                eyebrow="Every ingredient"
                title={
                  <>
                    What’s in the <em>blend.</em>
                  </>
                }
              >
                {drink.ingredients.lede}
              </SectionHeader>
            </Reveal>
            <div className="lg:col-span-7 lg:col-start-6">
              <dl className="border-t border-moss/15">
                {drink.ingredients.groups.map((g, i) => (
                  <Reveal
                    key={g.title}
                    delay={i * 60}
                    className="grid gap-3 border-b border-moss/15 py-7 md:grid-cols-[13rem_1fr] md:gap-8"
                  >
                    <dt className="font-display text-2xl text-moss">{g.title}</dt>
                    <dd className="leading-relaxed text-ink-soft">{g.items}</dd>
                  </Reveal>
                ))}
              </dl>
              <Reveal className="mt-8 grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
                <p className="rounded-lg bg-cream p-6 text-ink">
                  <span className="mb-2 block eyebrow text-terracotta-deep">Contains</span>
                  {drink.ingredients.contains}
                </p>
                <p className="rounded-lg bg-cream p-6 text-ink">
                  <span className="mb-2 block eyebrow text-sage-deep">Full list</span>
                  This is a summary. Ask any team member for complete ingredient information.
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 md:py-32">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeader
              eyebrow="About our matcha"
              title={
                <>
                  The part most places <em>skip.</em>
                </>
              }
            />
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={100}>
            <Accordion items={matchaFaqs} defaultOpen={0} />
            <Link
              href="/matcha/"
              className="mt-8 inline-block text-sm text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss"
            >
              More about our matcha
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-24 md:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="Keep exploring"
              title={
                <>
                  You might also <em>love.</em>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((d, i) => (
              <Reveal key={d.slug} delay={i * 100}>
                <DrinkCard
                  drink={d}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
