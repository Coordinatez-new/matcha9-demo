"use client";

import { useHydrated } from "@/components/order/bag-store";
import { CheckoutView } from "@/components/views/CheckoutView";
import { planPickup } from "@/lib/pickup";
import { demoCheckout } from "../actions";
import { useDemoState } from "../store";
import { demoStorefront } from "./chrome";

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
