"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ImageRef } from "@/lib/menu";
import { imageSrc } from "@/lib/paths";

type Shot = { src: ImageRef; alt: string; label: string; kind: "product" | "photo" };

/** Two views of a drink: the clean product shot and the real photo at the bar. */
export function DrinkGallery({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState(0);
  const current = shots[active] ?? shots[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper">
        {shots.map((shot, i) => (
          <Image
            key={shot.label}
            src={imageSrc(shot.src.src)}
            alt={shot.alt}
            fill
            preload={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            aria-hidden={i !== active}
            className={cn(
              "transition-opacity duration-700 ease-calm",
              shot.kind === "product" ? "object-contain p-10 mix-blend-multiply" : "object-cover",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      {shots.length > 1 && (
        <div className="mt-4 flex gap-3" role="group" aria-label="Choose a photo">
          {shots.map((shot, i) => (
            <button
              key={shot.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show ${shot.label.toLowerCase()}`}
              className={cn(
                "relative size-20 overflow-hidden rounded-md border transition-colors duration-300",
                i === active ? "border-moss" : "border-line hover:border-moss/40",
                shot.kind === "product" && "bg-paper",
              )}
            >
              <Image
                src={imageSrc(shot.src.src)}
                alt=""
                fill
                sizes="80px"
                className={
                  shot.kind === "product" ? "object-contain p-2 mix-blend-multiply" : "object-cover"
                }
              />
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 eyebrow text-sage-deep" aria-live="polite">
        {current?.label}
      </p>
    </div>
  );
}
