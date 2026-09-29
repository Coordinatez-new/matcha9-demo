import type { Metadata } from "next";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { OrderBand } from "@/components/ui/OrderBand";
import { PageIntro } from "@/components/ui/PageIntro";
import { countWord, formatMoney } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getPublicMenu } from "@/server/menu";

export async function generateMetadata(): Promise<Metadata> {
  const { items } = await getPublicMenu();
  const from = items.length ? Math.min(...items.map((i) => i.priceCents)) : 0;
  const names = items.map((i) => i.name);
  const list =
    names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join("");
  return pageMetadata({
    title: "Menu",
    description: `${countWord(items.length)} signature matcha drinks from ${formatMoney(from)}: ${list}. Order ahead for pickup.`,
  });
}

export default async function MenuPage() {
  const { items, categories } = await getPublicMenu();
  return (
    <>
      <PageIntro
        eyebrow="The menu"
        title={
          <>
            {countWord(items.length)} drinks,{" "}
            <em className="font-normal text-sage-deep">one standard.</em>
          </>
        }
      >
        From a pure, unsweetened classic to layered creations you’ll want to photograph first. Every
        one starts with the same organic, ceremonial-grade Japanese matcha, whisked to order.
      </PageIntro>

      <section className="container-page pb-24 md:pb-32">
        <div className="mb-12 grid gap-6 border-y border-line py-7 text-sm md:grid-cols-3">
          <p>
            <span className="block eyebrow text-sage-deep">Order ahead</span>
            <span className="mt-2 block text-ink">
              Tap + to add a drink, pick it up at the counter
            </span>
          </p>
          <p>
            <span className="block eyebrow text-sage-deep">In every cup</span>
            <span className="mt-2 block text-ink">
              Certified organic, ceremonial-grade Japanese matcha
            </span>
          </p>
          <p>
            <span className="block eyebrow text-sage-deep">Ways to order</span>
            <span className="mt-2 block text-ink">Hot or iced · Milk, water or coconut water</span>
          </p>
        </div>

        {items.length > 0 ? (
          <MenuGrid items={items} categories={categories} />
        ) : (
          <p className="py-16 font-display text-3xl text-moss">
            The menu is being refreshed. Please check back shortly.
          </p>
        )}

        <p className="mt-20 max-w-2xl text-sm leading-relaxed text-ink-soft">{site.allergyNote}</p>
      </section>

      <OrderBand />
    </>
  );
}
