"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Category, MenuItem } from "@/lib/menu";
import { DrinkCard } from "./DrinkCard";

/** Full menu with category filters. Renders every drink on the server; filtering is client-side. */
export function MenuGrid({ items, categories }: { items: MenuItem[]; categories: Category[] }) {
  const [filter, setFilter] = useState<string>("all");
  const options = [{ id: "all", label: "All drinks" }, ...categories];
  const numbered = items.map((item, index) => ({ item, index }));
  const visible =
    filter === "all" ? numbered : numbered.filter(({ item }) => item.categoryId === filter);

  return (
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label="Filter the menu" className="flex flex-wrap gap-2.5">
          {options.map((o) => {
            const count =
              o.id === "all" ? items.length : items.filter((i) => i.categoryId === o.id).length;
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
      )}

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "drink" : "drinks"}
      </p>

      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3">
        {visible.map(({ item, index }) => (
          <DrinkCard
            key={item.id}
            item={item}
            index={index}
            className="animate-menu-in"
            sizes="(min-width: 1024px) 30vw, 48vw"
          />
        ))}
      </div>
    </div>
  );
}
