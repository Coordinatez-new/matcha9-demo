"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { defaultSelections, type OrderableItem } from "@/lib/menu";
import { CheckIcon, Plus } from "@/components/ui/icons";
import { useBag } from "./BagProvider";

/** Round "+" on a menu card: adds the drink with its default options. */
export function QuickAdd({ item, className }: { item: OrderableItem; className?: string }) {
  const { canOrder, add } = useBag();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!canOrder || !item.inStock) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          add(item, defaultSelections(item));
          setAdded(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setAdded(false), 1800);
        }}
        aria-label={`Add ${item.name} to your bag`}
        className={cn(
          "grid size-11 place-items-center rounded-full border shadow-[0_8px_24px_-12px_rgb(31_39_29/0.45)] transition-[background-color,color,border-color,transform] duration-300 ease-calm active:scale-95",
          added
            ? "border-moss bg-moss text-cream"
            : "border-moss/15 bg-cream/90 text-moss backdrop-blur-sm hover:border-moss hover:bg-moss hover:text-cream",
          className,
        )}
      >
        {added ? <CheckIcon className="size-5" /> : <Plus className="size-5" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {added ? `${item.name} added to your bag` : ""}
      </span>
    </>
  );
}
