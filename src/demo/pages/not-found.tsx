"use client";

import { usePathname } from "next/navigation";
import { DrinkView } from "@/components/views/DrinkView";
import { NotFoundView } from "@/components/views/NotFoundView";
import { publicMenu, useDemoState } from "../store";
import { DemoSiteChrome } from "./chrome";

/**
 * GitHub Pages serves this for any unknown address. A drink added in the preview's dashboard
 * has no prebuilt page, so its address lands here and is rendered from the demo store.
 */
function NotFoundOrNewDrink() {
  const pathname = usePathname();
  const state = useDemoState();
  const slug = /^\/menu\/([a-z0-9-]+)\/?$/.exec(pathname)?.[1];
  const menu = publicMenu(state);
  const item = slug ? menu.items.find((i) => i.slug === slug) : undefined;
  return item ? <DrinkView item={item} menu={menu} /> : <NotFoundView />;
}

export function DemoNotFound() {
  return (
    <DemoSiteChrome>
      <NotFoundOrNewDrink />
    </DemoSiteChrome>
  );
}
