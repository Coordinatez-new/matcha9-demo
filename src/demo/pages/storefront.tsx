"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { useHydrated } from "@/components/order/bag-store";
import { ButtonLink } from "@/components/ui/Button";
import { CheckoutView } from "@/components/views/CheckoutView";
import { DrinkView } from "@/components/views/DrinkView";
import { HomeView } from "@/components/views/HomeView";
import { MatchaView } from "@/components/views/MatchaView";
import { MenuView } from "@/components/views/MenuView";
import { NotFoundView } from "@/components/views/NotFoundView";
import { OrderView } from "@/components/views/OrderView";
import { VisitView } from "@/components/views/VisitView";
import { toOrderable } from "@/lib/menu";
import { toGuestOrder } from "@/lib/orders";
import { planPickup } from "@/lib/pickup";
import { hoursLine } from "@/lib/settings";
import { buildStorefront } from "@/lib/storefront";
import { demoCheckout } from "../actions";
import { publicMenu, useDemoState, type DemoState } from "../store";

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

function demoStorefront(state: DemoState, now: Date | null) {
  const { items } = publicMenu(state);
  return buildStorefront(state.settings, items.filter((i) => i.featured).map(toOrderable), now);
}

export function DemoHome() {
  const state = useDemoState();
  return <HomeView items={publicMenu(state).items} hours={hoursLine(state.settings.store.hours)} />;
}

export function DemoMenu() {
  const menu = publicMenu(useDemoState());
  return <MenuView items={menu.items} categories={menu.categories} />;
}

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

export function DemoMatcha() {
  return <MatchaView items={publicMenu(useDemoState()).items} />;
}

export function DemoVisit() {
  const { store } = useDemoState().settings;
  return <VisitView hours={hoursLine(store.hours)} hoursNote={store.hoursNote} />;
}

export function DemoCheckout() {
  const state = useDemoState();
  const hydrated = useHydrated();
  const now = hydrated ? new Date() : null;
  return (
    <CheckoutView
      storefront={demoStorefront(state, now)}
      plan={now ? planPickup(now, state.settings.store.hours, state.settings.ordering) : null}
      actions={demoCheckout}
      note={
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft">
          Design preview: orders placed here stay in your browser and aren’t sent to the bar.
        </p>
      }
    />
  );
}

/** Explains the preview on its order page, and points to the dashboard to move it along. */
function PreviewOrderNote() {
  return (
    <p className="mt-10 rounded-lg border border-dashed border-line p-5 text-sm leading-relaxed text-ink-soft">
      <span className="font-medium text-ink">This is a design preview.</span> Your order is kept in
      this browser and isn’t sent to the bar. Open the{" "}
      <Link
        href="/admin/orders"
        className="text-moss underline decoration-moss/30 underline-offset-4"
      >
        dashboard
      </Link>{" "}
      to move it along and watch this page update.
    </p>
  );
}

function OrderFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  const state = useDemoState();
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <p className="container-page py-32 text-ink-soft" role="status">
        Finding your order…
      </p>
    );
  }
  const order = state.orders.find((o) => o.publicId === id);
  if (!order) {
    return (
      <section className="container-page py-24">
        <h1 className="text-display-lg">We couldn’t find that order.</h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          In this preview, orders are kept in the browser that placed them.
        </p>
        <ButtonLink href="/menu" className="mt-10">
          Start an order
        </ButtonLink>
      </section>
    );
  }
  return (
    <OrderView
      order={toGuestOrder(order)}
      pickupInstructions={state.settings.ordering.pickupInstructions}
      live={false}
      note={<PreviewOrderNote />}
    />
  );
}

export function DemoOrder() {
  return (
    <Suspense>
      <OrderFromQuery />
    </Suspense>
  );
}

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
