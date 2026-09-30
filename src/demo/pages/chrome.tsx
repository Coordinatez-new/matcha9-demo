"use client";

import type { ReactNode } from "react";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { useHydrated } from "@/components/order/bag-store";
import { toOrderable } from "@/lib/menu";
import { buildStorefront } from "@/lib/storefront";
import { publicMenu, useDemoState, type DemoState } from "../store";

/*
 * The preview's page wrappers live one per module (chrome, home, menu, drink…) so each route
 * only loads its own code: the checkout's form validation, for one, stays off every other page.
 */

/** The storefront frame for the GitHub Pages preview, filled from the demo store. */
export function DemoSiteChrome({ children }: { children: ReactNode }) {
  const state = useDemoState();
  const hydrated = useHydrated();
  const storefront = demoStorefront(state, hydrated ? new Date() : null);
  return (
    <SiteFrame storefront={storefront} announcement={state.settings.announcement}>
      {children}
    </SiteFrame>
  );
}

export function demoStorefront(state: DemoState, now: Date | null) {
  const { items } = publicMenu(state);
  return buildStorefront(state.settings, items.filter((i) => i.featured).map(toOrderable), now);
}
