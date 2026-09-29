"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/menu";
import type { PickupPlan } from "@/lib/pickup";
import { fullAddress, site } from "@/lib/site";
import type { Quote } from "@/server/orders";
import { bagStore, useHydrated } from "@/components/order/bag-store";
import { useBag } from "@/components/order/BagProvider";
import { QuantityStepper } from "@/components/order/QuantityStepper";
import { buttonClasses, ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight, PinIcon } from "@/components/ui/icons";
import { placeOrderAction, quoteAction } from "./actions";

const input =
  "w-full rounded-lg border bg-paper px-4 py-3 text-ink transition-colors placeholder:text-sage focus:border-moss focus:outline-none";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-soft">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-sm text-terracotta-deep">{error}</span>}
    </label>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="flex items-baseline gap-4 font-display text-3xl">
        <span className="font-display text-base text-sage italic">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CheckoutForm({ plan }: { plan: PickupPlan }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { lines, setQuantity } = useBag();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, startTransition] = useTransition();
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Partial<Record<string, string>>>({});
  const [when, setWhen] = useState<"asap" | "later">(plan.asap ? "asap" : "later");
  const [dayKey, setDayKey] = useState(plan.days[0]?.key ?? "");
  const [slot, setSlot] = useState(plan.days[0]?.slots[0]?.at ?? "");

  const payload = useMemo(
    () =>
      lines.map((l) => ({
        key: l.key,
        itemId: l.itemId,
        quantity: l.quantity,
        selections: l.selections,
      })),
    [lines],
  );
  const payloadKey = JSON.stringify(payload);

  // Re-price the bag against the live menu whenever it changes.
  useEffect(() => {
    const sent: typeof payload = JSON.parse(payloadKey);
    if (!sent.length) return;
    let current = true;
    quoteAction(sent).then((q) => {
      if (!current) return;
      setQuote(q);
      bagStore.reprice(
        new Map(q.lines.map((l) => [sent[l.index]!.key, l.unitPriceCents] as const)),
      );
    });
    return () => {
      current = false;
    };
  }, [payloadKey]);

  if (!hydrated) {
    return (
      <p className="py-24 text-ink-soft" role="status">
        Loading your bag…
      </p>
    );
  }

  if (placed) {
    return (
      <p className="py-24 font-display text-3xl text-moss" role="status">
        Sending your order to the bar…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-16">
        <p className="font-display text-4xl text-moss">Your bag is empty.</p>
        <p className="mt-3 text-ink-soft">Add a drink or two, then come back to check out.</p>
        <ButtonLink href="/menu" className="mt-8">
          Browse the menu
        </ButtonLink>
      </div>
    );
  }

  const issues = new Map(quote?.issues.map((i) => [i.index, i.message]) ?? []);
  const general = quote?.issues.filter((i) => i.index < 0) ?? [];
  const fresh =
    quote && quote.lines.length + quote.issues.filter((i) => i.index >= 0).length === lines.length;
  const subtotal = fresh
    ? quote.subtotalCents
    : lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const day = plan.days.find((d) => d.key === dayKey) ?? plan.days[0];
  const noTimes = !plan.asap && plan.days.length === 0;
  const blocked = issues.size > 0 || general.length > 0 || noTimes;

  const submit = (form: FormData) => {
    setError(null);
    setFields({});
    const data = {
      lines: payload.map(({ itemId, quantity, selections }) => ({ itemId, quantity, selections })),
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      notes: String(form.get("notes") ?? ""),
      pickup: when === "asap" ? "asap" : slot,
      website: String(form.get("website") ?? ""),
    };
    startTransition(async () => {
      const result = await placeOrderAction(data);
      if (result.ok) {
        setPlaced(true);
        bagStore.clear();
        router.push(`/order/${result.publicId}`);
        return;
      }
      setError(result.error);
      setFields(result.fields ?? {});
      // Pickup times move on; fetch a fresh list if the chosen one has passed.
      if (/pickup/i.test(result.error)) router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(new FormData(e.currentTarget));
      }}
      className="grid gap-14 lg:grid-cols-12"
      noValidate
    >
      <div className="space-y-12 lg:col-span-7">
        <Step n="01" title="Pickup time">
          <div className="space-y-3">
            {plan.asap && (
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-moss",
                  when === "asap" ? "border-moss bg-paper" : "border-line hover:border-moss/40",
                )}
              >
                <input
                  type="radio"
                  name="when"
                  checked={when === "asap"}
                  onChange={() => setWhen("asap")}
                  className="mt-1 accent-moss"
                />
                <span>
                  <span className="block font-medium text-ink">As soon as possible</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    Ready in about {plan.asap.minutes} minutes
                  </span>
                </span>
              </label>
            )}
            {plan.days.length > 0 && (
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-moss",
                  when === "later" ? "border-moss bg-paper" : "border-line hover:border-moss/40",
                )}
              >
                <input
                  type="radio"
                  name="when"
                  checked={when === "later"}
                  onChange={() => setWhen("later")}
                  className="mt-1 accent-moss"
                />
                <span className="flex-1">
                  <span className="block font-medium text-ink">
                    {plan.asap ? "Schedule for later" : "Choose a pickup time"}
                  </span>
                  {!plan.asap && (
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      We’re closed right now, so pick a time once we’re open.
                    </span>
                  )}
                </span>
              </label>
            )}
            {when === "later" && day && (
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <Field label="Day">
                  <select
                    value={day.key}
                    onChange={(e) => {
                      setDayKey(e.target.value);
                      const next = plan.days.find((d) => d.key === e.target.value);
                      setSlot(next?.slots[0]?.at ?? "");
                    }}
                    className={cn(input, "border-line")}
                  >
                    {plan.days.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Time" error={fields.pickup}>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className={cn(input, "border-line")}
                  >
                    {day.slots.map((s) => (
                      <option key={s.at} value={s.at}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            {noTimes && (
              <p className="rounded-lg bg-paper p-5 text-sm text-ink-soft">
                There are no pickup times left right now. Please call us on{" "}
                <a href={site.phone.href} className="text-moss underline underline-offset-4">
                  {site.phone.display}
                </a>
                .
              </p>
            )}
          </div>
        </Step>

        <Step n="02" title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name for the order" error={fields.name}>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={60}
                className={cn(input, fields.name ? "border-terracotta-deep" : "border-line")}
              />
            </Field>
            <Field label="Phone" hint="In case we need you" error={fields.phone}>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={30}
                className={cn(input, fields.phone ? "border-terracotta-deep" : "border-line")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" hint="Optional" error={fields.email}>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  className={cn(input, fields.email ? "border-terracotta-deep" : "border-line")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Notes for the bar" hint="Optional" error={fields.notes}>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={240}
                  placeholder="Allergies, less ice, anything we should know"
                  className={cn(
                    input,
                    "resize-y",
                    fields.notes ? "border-terracotta-deep" : "border-line",
                  )}
                />
              </Field>
            </div>
            {/* Honeypot for bots; hidden from people and assistive tech. */}
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] size-px opacity-0"
            />
          </div>
        </Step>

        <Step n="03" title="Payment">
          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="font-medium text-ink">Pay at the counter when you pick up</p>
            <p className="mt-1 text-sm text-ink-soft">
              Your order goes straight to the Matcha 9 bar. Any tax is added when you pay.
            </p>
          </div>
        </Step>
      </div>

      <aside className="lg:col-span-5">
        <div className="rounded-lg bg-paper p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 className="eyebrow font-sans text-sage-deep">Your order</h2>
          <ul className="mt-5 divide-y divide-line">
            {lines.map((line, index) => (
              <li key={line.key} className="flex gap-4 py-4 first:pt-0">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream">
                  {line.image && (
                    <Image
                      src={line.image.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1 mix-blend-multiply"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-xl leading-tight text-moss">{line.name}</p>
                    <span className="text-sm text-ink tabular-nums">
                      {formatMoney(line.unitPriceCents * line.quantity)}
                    </span>
                  </div>
                  {line.summary && <p className="mt-0.5 text-xs text-ink-soft">{line.summary}</p>}
                  <div className="mt-2.5">
                    <QuantityStepper
                      size="sm"
                      min={0}
                      value={line.quantity}
                      onChange={(q) => setQuantity(line.key, q)}
                      label={`Quantity of ${line.name}`}
                    />
                  </div>
                  {issues.get(index) && (
                    <p className="mt-2 text-sm text-terracotta-deep">
                      {issues.get(index)}{" "}
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, 0)}
                        className="underline underline-offset-4"
                      >
                        Remove it
                      </button>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {general.map((g) => (
            <p key={g.message} className="mt-3 text-sm text-terracotta-deep">
              {g.message}
            </p>
          ))}
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="eyebrow text-sage-deep">Subtotal</span>
            <span className="font-display text-3xl text-moss tabular-nums">
              {formatMoney(subtotal)}
            </span>
          </div>

          {error && (
            <p
              className="mt-5 rounded-lg bg-terracotta/15 p-4 text-sm text-terracotta-deep"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || blocked}
            className={buttonClasses("primary", "md", "mt-6 w-full")}
          >
            {pending ? "Placing your order…" : `Place pickup order · ${formatMoney(subtotal)}`}
          </button>

          <div className="mt-6 flex gap-3 border-t border-line pt-6 text-sm text-ink-soft">
            <PinIcon className="mt-0.5 size-5 shrink-0 text-sage-deep" />
            <p>
              <span className="block text-ink">
                Matcha 9 counter, {site.address.venue.replace(/^Inside/, "inside")}
              </span>
              {fullAddress}
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex w-fit items-center gap-1 text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss"
              >
                Directions <ArrowUpRight className="size-3" />
              </a>
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Questions or a change of plan? Call{" "}
            <a href={site.phone.href} className="underline underline-offset-2">
              {site.phone.display}
            </a>
            .{" "}
            <Link href="/menu" className="underline underline-offset-2">
              Add more drinks
            </Link>
          </p>
        </div>
      </aside>
    </form>
  );
}
