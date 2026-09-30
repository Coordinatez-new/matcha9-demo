import type { ReactNode } from "react";
import { CheckoutForm, type CheckoutActions } from "@/components/order/CheckoutForm";
import { OpenStatus } from "@/components/order/OpenStatus";
import { ButtonLink } from "@/components/ui/Button";
import type { PickupPlan } from "@/lib/pickup";
import type { Storefront } from "@/lib/storefront";

/** Checkout: the pickup form when ordering is on here, otherwise where to order instead. */
export function CheckoutView({
  storefront,
  plan,
  actions,
  note,
}: {
  storefront: Storefront;
  plan: PickupPlan | null;
  actions: CheckoutActions;
  /** A line under the heading, e.g. the preview's demo note. */
  note?: ReactNode;
}) {
  return (
    <section className="container-page pt-12 pb-24 md:pt-16 md:pb-32">
      <p className="eyebrow text-sage-deep">Pickup order</p>
      <h1 className="mt-5 text-display-lg">
        Almost <em className="font-normal text-sage-deep">ready.</em>
      </h1>
      {note}

      <div className="mt-12">
        {storefront.mode === "onsite" ? (
          plan ? (
            <CheckoutForm plan={plan} actions={actions} />
          ) : (
            <p className="py-24 text-ink-soft" role="status">
              Loading pickup times…
            </p>
          )
        ) : storefront.mode === "toast" ? (
          <div className="max-w-xl space-y-6">
            <p className="text-lg leading-relaxed text-ink-soft">
              Online orders are being taken on our Toast ordering page right now, for pickup or
              delivery.
            </p>
            <ButtonLink href={storefront.toastUrl} external>
              Order on Toast
            </ButtonLink>
          </div>
        ) : (
          <div className="max-w-xl space-y-8">
            <OpenStatus storefront={storefront} className="rounded-lg bg-paper p-6 text-base" />
            <ButtonLink href="/visit" variant="outline">
              Find the bar
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
