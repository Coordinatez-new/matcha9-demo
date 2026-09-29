import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DrinkCard } from "@/components/menu/DrinkCard";
import { DrinkGallery } from "@/components/menu/DrinkGallery";
import { AddToBag } from "@/components/order/AddToBag";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutMatcha } from "@/content/matcha";
import { formatMoney, menuNumber, toOrderable, type ImageRef } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";
import { site, siteOrigin } from "@/lib/site";
import { getPublicItem, getPublicMenu } from "@/server/menu";

export async function generateMetadata(props: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPublicItem(slug);
  if (!item) return {};
  const description = `${item.name}, ${formatMoney(item.priceCents)}: ${item.components.join(" · ")}. ${item.tagline}`;
  const image = item.productImage ?? item.photoImage;
  return pageMetadata({
    title: item.name,
    description,
    images: image
      ? [
          {
            url: `${siteOrigin}${image.src}`,
            width: image.width,
            height: image.height,
            alt: item.productImageAlt,
          },
        ]
      : undefined,
  });
}

const matchaFaqs = aboutMatcha.filter((f) =>
  ["What matcha actually is", "First harvest", "Caffeine, and why it feels different"].includes(
    f.q,
  ),
);

export default async function DrinkPage(props: PageProps<"/menu/[slug]">) {
  const { slug } = await props.params;
  const [item, menu] = await Promise.all([getPublicItem(slug), getPublicMenu()]);
  if (!item) notFound();

  const index = menu.items.findIndex((i) => i.id === item.id);
  const others = menu.items.filter((i) => i.id !== item.id);
  const related = others.length
    ? [0, 1, 2]
        .map((n) => others[(Math.max(index, 0) + n) % others.length]!)
        .filter((d, i, all) => all.findIndex((x) => x.id === d.id) === i)
    : [];
  const category = menu.categories.find((c) => c.id === item.categoryId)?.label;

  const shots: { src: ImageRef; alt: string; label: string; kind: "product" | "photo" }[] = [];
  if (item.productImage) {
    shots.push({
      src: item.productImage,
      alt: item.productImageAlt,
      label: "Studio shot",
      kind: "product",
    });
  }
  if (item.photoImage) {
    shots.push({
      src: item.photoImage,
      alt: item.photoImageAlt,
      label: "At the bar",
      kind: "photo",
    });
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="container-page pt-8">
        <ol className="flex items-center gap-2 text-sm text-ink-soft">
          <li>
            <Link href="/menu" className="transition-colors hover:text-moss">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="text-moss">
            {item.name}
          </li>
        </ol>
      </nav>

      <section className="container-page grid gap-14 pt-8 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-6">
          {shots.length > 0 ? (
            <DrinkGallery shots={shots} />
          ) : (
            <div className="aspect-[4/5] rounded-lg bg-paper" />
          )}
        </div>

        <div className="animate-rise [animation-delay:120ms] lg:col-span-5 lg:col-start-8 lg:pt-4">
          <p className="flex flex-wrap items-center gap-3 eyebrow text-sage-deep">
            {index >= 0 && menuNumber(index)}
            {category && (
              <>
                <span className="h-px w-6 bg-line" aria-hidden="true" />
                {category}
              </>
            )}
            {item.badge && (
              <span className="rounded-full border border-moss/15 px-2.5 py-0.5 text-[0.6rem] text-moss">
                {item.badge}
              </span>
            )}
          </p>
          <h1 className="mt-5 text-display-lg">{item.name}</h1>
          <p className="mt-4 font-display text-3xl text-ink-soft">{formatMoney(item.priceCents)}</p>
          <p className="mt-8 text-lg leading-relaxed text-ink-soft">{item.description}</p>

          {item.components.length > 0 && (
            <div className="mt-10 border-t border-line pt-7">
              <h2 className="eyebrow font-sans text-sage-deep">In the glass</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.components.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-moss"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 border-t border-line pt-8">
            <AddToBag item={toOrderable(item)} toastUrl={item.toastUrl} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/visit" variant="outline" size="sm">
              Visit the bar
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink-soft">{site.allergyNote}</p>
        </div>
      </section>

      {item.ingredients && (
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
                {item.ingredients.lede}
              </SectionHeader>
            </Reveal>
            <div className="lg:col-span-7 lg:col-start-6">
              <dl className="border-t border-moss/15">
                {item.ingredients.groups.map((g, i) => (
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
                {item.ingredients.contains && (
                  <p className="rounded-lg bg-cream p-6 text-ink">
                    <span className="mb-2 block eyebrow text-terracotta-deep">Contains</span>
                    {item.ingredients.contains}
                  </p>
                )}
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
              href="/matcha"
              className="mt-8 inline-block text-sm text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss"
            >
              More about our matcha
            </Link>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
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
                <Reveal key={d.id} delay={i * 100}>
                  <DrinkCard
                    item={d}
                    index={menu.items.findIndex((x) => x.id === d.id)}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
