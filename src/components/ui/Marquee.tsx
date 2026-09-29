import { Fragment } from "react";
import { cn } from "@/lib/cn";

type MarqueeProps = { items: string[]; className?: string };

/** Slow, continuous line of brand words. Duplicated once so the loop is seamless. */
export function Marquee({ items, className }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <Fragment key={item}>
          <span className="px-8 font-display text-2xl whitespace-nowrap text-moss italic md:text-3xl">
            {item}
          </span>
          <span className="text-[0.55rem] text-terracotta" aria-hidden="true">
            ◆
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={cn("group overflow-hidden border-y border-line py-6", className)}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
