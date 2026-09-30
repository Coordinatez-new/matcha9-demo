"use client";

import { ButtonLink } from "@/components/ui/Button";
import { DrinkView } from "@/components/views/DrinkView";
import { publicMenu, useDemoState } from "../store";

function MissingDrink() {
  return (
    <section className="container-page flex min-h-[50vh] flex-col items-start justify-center py-24">
      <p className="eyebrow text-sage-deep">Menu</p>
      <h1 className="mt-6 text-display-lg">
        This drink is <em className="font-normal text-sage-deep">off the menu.</em>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
        It’s hidden or no longer served. Everything we’re pouring right now is on the menu.
      </p>
      <ButtonLink href="/menu" className="mt-10">
        See the menu
      </ButtonLink>
    </section>
  );
}

export function DemoDrink({ slug }: { slug: string }) {
  const menu = publicMenu(useDemoState());
  const item = menu.items.find((i) => i.slug === slug);
  return item ? <DrinkView item={item} menu={menu} /> : <MissingDrink />;
}
