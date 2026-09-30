import type { Metadata } from "next";
import { CheckoutView } from "@/components/views/CheckoutView";
import { toOrderable } from "@/lib/menu";
import { planPickup } from "@/lib/pickup";
import { buildStorefront } from "@/lib/storefront";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";
import { placeOrderAction, quoteAction } from "./actions";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, menu] = await Promise.all([getSettings(), getPublicMenu()]);
  const now = new Date();
  return (
    <CheckoutView
      storefront={buildStorefront(settings, menu.items.map(toOrderable), now)}
      plan={planPickup(now, settings.store.hours, settings.ordering)}
      actions={{ quote: quoteAction, place: placeOrderAction }}
    />
  );
}
