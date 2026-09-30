"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useHydrated } from "@/components/order/bag-store";
import { ButtonLink } from "@/components/ui/Button";
import { OrderView } from "@/components/views/OrderView";
import { toGuestOrder } from "@/lib/orders";
import { useDemoState } from "../store";

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
