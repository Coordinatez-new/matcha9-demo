import type { ReactNode } from "react";
import { AutoRefresh } from "@/components/order/AutoRefresh";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { Hanko } from "@/components/ui/Hanko";
import { cn } from "@/lib/cn";
import { describeSelections, formatMoney } from "@/lib/menu";
import { statusCopy, statusFlow, type GuestOrder } from "@/lib/orders";
import { describeTime, storeClock } from "@/lib/pickup";
import { fullAddress, site } from "@/lib/site";

const stepLabels: Record<string, string> = {
  received: "Received",
  preparing: "Whisking",
  ready: "Ready",
  picked_up: "Picked up",
};

/** A guest's order: status as it moves along, pickup time and place, and what's in it. */
export function OrderView({
  order,
  pickupInstructions,
  live = true,
  note,
}: {
  order: GuestOrder;
  pickupInstructions: string;
  /** Re-render from the server every few seconds while the order is open (server build). */
  live?: boolean;
  /** Extra line under the order details, e.g. the preview's demo hint. */
  note?: ReactNode;
}) {
  const copy = statusCopy[order.status];
  const cancelled = order.status === "cancelled";
  const done = order.status === "picked_up" || cancelled;
  const step = statusFlow.indexOf(order.status);
  const pickup = new Date(order.pickupAt);
  const when = order.pickupAsap
    ? `As soon as possible, around ${storeClock(pickup)}`
    : describeTime(pickup);
  const reachedAt = (s: string) => order.events.find((e) => e.status === s)?.createdAt;

  return (
    <section className="container-page pt-12 pb-24 md:pt-16 md:pb-32">
      {live && <AutoRefresh active={!done} />}
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4">
            <Hanko className="m9-stamp size-11 text-xl" />
            <p className="eyebrow text-sage-deep">
              Order #{order.number} · for {order.firstName}
              <span
                lang="ja"
                className="ml-3 font-jp font-normal tracking-[0.3em] text-sage normal-case"
              >
                ありがとう
              </span>
            </p>
          </div>
          <h1 className="mt-5 text-display-lg" aria-live="polite">
            {copy.guestTitle}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">{copy.guestDetail}</p>

          {!cancelled && (
            <ol className="mt-12 grid grid-cols-4 gap-2" aria-label="Order progress">
              {statusFlow.map((s, i) => {
                const reached = i <= step;
                const at = reachedAt(s);
                return (
                  <li key={s} aria-current={i === step ? "step" : undefined}>
                    <span
                      className={cn(
                        "block h-1 rounded-full transition-colors duration-700",
                        reached ? "bg-moss" : "bg-line",
                        i === step && !done && "animate-pulse",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-3 block text-xs font-semibold tracking-[0.14em] uppercase sm:text-[0.72rem]",
                        reached ? "text-moss" : "text-sage",
                      )}
                    >
                      {stepLabels[s]}
                    </span>
                    {at && reached && (
                      <span className="mt-0.5 block text-xs text-ink-soft tabular-nums">
                        {storeClock(new Date(at))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          <dl className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-sage-deep">Pickup</dt>
              <dd className="mt-2 font-display text-2xl text-moss">{when}</dd>
            </div>
            <div>
              <dt className="eyebrow text-sage-deep">Where</dt>
              <dd className="mt-2 text-ink">
                Matcha 9 counter, {site.address.venue.replace(/^Inside/, "inside")}
                <span className="block text-sm text-ink-soft">{fullAddress}</span>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss"
                >
                  Directions
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-sage-deep">When you arrive</dt>
              <dd className="mt-2 leading-relaxed text-ink-soft">{pickupInstructions}</dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/menu" variant="outline">
              Order something else
            </ButtonLink>
            <ArrowLink href={site.phone.href} className="text-moss">
              Call the bar
            </ArrowLink>
          </div>
          {note}
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-lg bg-paper p-6 sm:p-8">
            <h2 className="eyebrow font-sans text-sage-deep">
              {order.itemCount} {order.itemCount === 1 ? "drink" : "drinks"}
            </h2>
            <ul className="mt-5 divide-y divide-line">
              {order.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-baseline justify-between gap-4 py-4 first:pt-0"
                >
                  <div>
                    <p className="font-display text-xl text-moss">
                      <span className="text-sage tabular-nums">{line.quantity}×</span> {line.name}
                    </p>
                    {line.options.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {describeSelections(line.options)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-ink tabular-nums">
                    {formatMoney(line.lineTotalCents)}
                  </span>
                </li>
              ))}
            </ul>
            {order.notes && (
              <p className="mt-2 rounded-md bg-cream p-4 text-sm text-ink-soft">
                <span className="mb-1 block eyebrow text-sage-deep">Your note</span>
                {order.notes}
              </p>
            )}
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="eyebrow text-sage-deep">Subtotal</span>
              <span className="font-display text-3xl text-moss tabular-nums">
                {formatMoney(order.subtotalCents)}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-soft">Pay at the counter when you pick up.</p>
          </div>
          {!done && (
            <p className="mt-4 text-xs text-ink-soft">
              This page updates by itself. Keep it open, or bookmark it to check back.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
