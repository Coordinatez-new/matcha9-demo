"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { categories, drinks, type DrinkCategory } from "@/content/drinks";
import { DrinkCard } from "./DrinkCard";

type Filter = "all" | DrinkCategory;

/** Full menu with category filters. Renders every drink on the server; filtering is client-side. */
export function MenuGrid() {
  const [filter, setFilter] = useState<Filter>("all");
  const options: { id: Filter; label: string }[] = [
    { id: "all", label: "All drinks" },
    ...categories,
  ];
  const visible = filter === "all" ? drinks : drinks.filter((d) => d.category === filter);

  return (
    <div>
      <div role="group" aria-label="Filter the menu" className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const count =
            o.id === "all" ? drinks.length : drinks.filter((d) => d.category === o.id).length;
          const active = filter === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(o.id)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm transition-colors duration-300",
                active
                  ? "border-moss bg-moss text-cream"
                  : "border-line text-ink-soft hover:border-moss/40 hover:text-moss",
              )}
            >
              {o.label}
              <span className={cn("ml-2 tabular-nums", active ? "text-cream/60" : "text-sage")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "drink" : "drinks"}
      </p>

      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3">
        {visible.map((drink) => (
          <DrinkCard
            key={drink.slug}
            drink={drink}
            className="animate-menu-in"
            sizes="(min-width: 1024px) 30vw, 48vw"
          />
        ))}
      </div>
    </div>
  );
}
