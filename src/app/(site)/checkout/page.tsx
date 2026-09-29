import type { Metadata } from "next";
import { OpenStatus } from "@/components/order/OpenStatus";
import { ButtonLink } from "@/components/ui/Button";
import { toOrderable } from "@/lib/menu";
import { planPickup } from "@/lib/pickup";
import { buildStorefront } from "@/lib/storefront";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, menu] = await Promise.all([getSettings(), getPublicMenu()]);
  const { mode } = settings.ordering;

  return (
    <section className="container-page pt-12 pb-24 md:pt-16 md:pb-32">
      <p className="eyebrow text-sage-deep">Pickup order</p>
      <h1 className="mt-5 text-display-lg">
        Almost <em className="font-normal text-sage-deep">ready.</em>
      </h1>

      <div className="mt-12">
        {mode === "onsite" ? (
          <CheckoutForm plan={planPickup(new Date(), settings.store.hours, settings.ordering)} />
        ) : mode === "toast" ? (
          <div className="max-w-xl space-y-6">
            <p className="text-lg leading-relaxed text-ink-soft">
              Online orders are being taken on our Toast ordering page right now, for pickup or
              delivery.
            </p>
            <ButtonLink href={settings.toast.onlineOrderingUrl} external>
              Order on Toast
            </ButtonLink>
          </div>
        ) : (
          <div className="max-w-xl space-y-8">
            <OpenStatus
              storefront={buildStorefront(settings, menu.items.map(toOrderable))}
              className="rounded-lg bg-paper p-6 text-base"
            />
            <ButtonLink href="/visit" variant="outline">
              Find the bar
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
