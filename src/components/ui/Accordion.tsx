import { cn } from "@/lib/cn";
import { Plus } from "./icons";

type AccordionItem = { q: string; a: string[] };

type AccordionProps = {
  items: AccordionItem[];
  tone?: "light" | "dark";
  className?: string;
  /** Index of an item to show open on load. */
  defaultOpen?: number;
};

/** Accessible accordion built on native <details>, so it works without JavaScript. */
export function Accordion({ items, tone = "light", className, defaultOpen }: AccordionProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("border-t", dark ? "border-cream/15" : "border-line", className)}>
      {items.map((item, i) => (
        <details
          key={item.q}
          open={i === defaultOpen}
          className={cn("group border-b", dark ? "border-cream/15" : "border-line")}
        >
          <summary
            className={cn(
              "flex cursor-pointer items-center justify-between gap-6 py-6 font-display text-2xl transition-colors md:text-[1.7rem]",
              dark ? "text-cream hover:text-sage" : "text-moss hover:text-sage-deep",
            )}
          >
            {item.q}
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border transition-transform duration-500 ease-(--ease-calm) group-open:rotate-45",
                dark ? "border-cream/25" : "border-line",
              )}
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <div
            className={cn(
              "max-w-2xl space-y-4 pb-7 leading-relaxed",
              dark ? "text-cream/70" : "text-ink-soft",
            )}
          >
            {item.a.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
