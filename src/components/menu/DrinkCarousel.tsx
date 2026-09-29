"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

type DrinkCarouselProps = { children: ReactNode; label: string };

/** Horizontal, scroll-snapping row with previous/next controls. Swipe works natively. */
export function DrinkCarousel({ children, label }: DrinkCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const button =
    "grid size-12 place-items-center rounded-full border border-moss/20 text-moss transition-colors duration-300 hover:bg-moss hover:text-cream disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-[clamp(1.25rem,4vw,3rem)] no-scrollbar flex snap-x snap-mandatory scroll-px-[clamp(1.25rem,4vw,3rem)] gap-6 overflow-x-auto px-[clamp(1.25rem,4vw,3rem)] pb-2 focus-visible:outline-offset-8"
      >
        {children}
      </div>
      <div className="mt-10 flex gap-3">
        <button
          type="button"
          className={button}
          onClick={() => scroll(-1)}
          disabled={edges.start}
          aria-label="Previous drinks"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          className={button}
          onClick={() => scroll(1)}
          disabled={edges.end}
          aria-label="Next drinks"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

/** Wrapper for a single carousel slide. */
export function CarouselItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("w-[74%] shrink-0 snap-start sm:w-[42%] lg:w-[calc(25%-1.125rem)]", className)}
    >
      {children}
    </div>
  );
}
