"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { defaultSelections, formatMoney } from "@/lib/menu";
import { site } from "@/lib/site";
import { ArrowRight, ArrowUpRight, CloseIcon, Plus } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";
import { useBag } from "./BagProvider";
import { OpenStatus } from "./OpenStatus";
import { QuantityStepper } from "./QuantityStepper";

/** Slide-over bag for pickup orders. Opened from the header's "Order pickup" button. */
export function BagDrawer() {
  const { isOpen, closeBag, lines, count, subtotalCents, storefront, setQuantity, add, canOrder } =
    useBag();
  const closeButton = useRef<HTMLButtonElement>(null);

  // While open: the page behind is inert and doesn't scroll, and Escape closes the bag.
  useEffect(() => {
    if (!isOpen) return;
    const shell = document.getElementById("site-shell");
    const root = document.documentElement;
    shell?.setAttribute("inert", "");
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBag();
    document.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    return () => {
      shell?.removeAttribute("inert");
      root.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeBag]);

  const suggestions = storefront.suggestions.filter((s) => s.inStock).slice(0, 3);

  return (
    <div className={cn("fixed inset-0 z-[70]", !isOpen && "pointer-events-none")} inert={!isOpen}>
      <div
        aria-hidden="true"
        onClick={closeBag}
        className={cn(
          "absolute inset-0 bg-forest/35 backdrop-blur-[2px] transition-opacity duration-500 ease-calm",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-cream shadow-[-24px_0_60px_-30px_rgb(31_39_29/0.45)] transition-[transform,visibility] duration-500 ease-calm",
          isOpen ? "translate-x-0" : "invisible translate-x-full",
        )}
      >
        <header className="border-b border-line px-6 pt-6 pb-5 sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow text-sage-deep">Pickup order</p>
              <h2 id="bag-title" className="mt-2 font-display text-4xl">
                Your bag{count > 0 && <span className="text-sage"> · {count}</span>}
              </h2>
            </div>
            <button
              ref={closeButton}
              type="button"
              onClick={closeBag}
              aria-label="Close bag"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-moss/20 text-moss transition-colors hover:bg-moss hover:text-cream"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Matcha 9 counter · {site.address.venue.replace(/^Inside/, "inside")},{" "}
            {site.address.street}
          </p>
          <OpenStatus storefront={storefront} className="mt-4" />
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {lines.length > 0 ? (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5 first:pt-0">
                  <Link
                    href={`/menu/${line.slug}`}
                    onClick={closeBag}
                    className="relative size-20 shrink-0 overflow-hidden rounded-md bg-paper"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {line.image && (
                      <Image
                        src={line.image.src}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-1.5 mix-blend-multiply"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/menu/${line.slug}`}
                        onClick={closeBag}
                        className="font-display text-xl leading-tight text-moss hover:text-sage-deep"
                      >
                        {line.name}
                      </Link>
                      <span className="text-sm text-ink tabular-nums">
                        {formatMoney(line.unitPriceCents * line.quantity)}
                      </span>
                    </div>
                    {line.summary && <p className="mt-1 text-xs text-ink-soft">{line.summary}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        min={0}
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.key, q)}
                        label={`Quantity of ${line.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, 0)}
                        className="text-xs text-ink-soft underline decoration-line underline-offset-4 hover:text-moss hover:decoration-moss"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="font-display text-2xl text-moss">Nothing in your bag yet.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Order ahead and we’ll have it whisked and waiting at the counter.
              </p>
              {canOrder && suggestions.length > 0 && (
                <>
                  <p className="mt-8 eyebrow text-sage-deep">Start with a favourite</p>
                  <ul className="mt-4 space-y-3">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-line bg-paper p-3"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-paper">
                          {item.productImage && (
                            <Image
                              src={item.productImage.src}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-contain p-1 mix-blend-multiply"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg leading-tight text-moss">
                            {item.name}
                          </p>
                          <p className="text-xs text-ink-soft tabular-nums">
                            {formatMoney(item.priceCents)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => add(item, defaultSelections(item))}
                          aria-label={`Add ${item.name}`}
                          className="grid size-10 shrink-0 place-items-center rounded-full border border-moss/20 text-moss transition-colors hover:bg-moss hover:text-cream"
                        >
                          <Plus className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Link
                href="/menu"
                onClick={closeBag}
                className="group mt-8 inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.18em] text-moss uppercase"
              >
                Browse the full menu
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        <footer className="border-t border-line bg-paper px-6 pt-5 pb-6 sm:px-8">
          {lines.length > 0 && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-sage-deep">Subtotal</span>
                <span className="font-display text-2xl text-moss tabular-nums">
                  {formatMoney(subtotalCents)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Pay at the counter when you pick up. Any tax is added there.
              </p>
              {canOrder ? (
                <Link
                  href="/checkout"
                  onClick={closeBag}
                  className={buttonClasses("primary", "md", "mt-5 w-full")}
                >
                  Checkout · {formatMoney(subtotalCents)}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={buttonClasses("primary", "md", "mt-5 w-full")}
                >
                  Online ordering is paused
                </button>
              )}
            </>
          )}
          <a
            href={storefront.toastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs text-ink-soft underline decoration-line underline-offset-4 hover:text-moss hover:decoration-moss",
              lines.length > 0 && "mt-4",
            )}
          >
            Prefer delivery? Order it on Toast <ArrowUpRight className="size-3" />
          </a>
        </footer>
      </section>
    </div>
  );
}
