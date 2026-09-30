"use client";

import { useState } from "react";
import { PinIcon } from "./icons";

/**
 * The Google map, loaded only when a guest asks for it: the embed is half a megabyte of scripts
 * that would otherwise slow the Visit page down on every phone. Until then, a quiet paper-map
 * placeholder with the address.
 */
export function MapEmbed({ src, title, address }: { src: string; title: string; address: string }) {
  const [open, setOpen] = useState(false);
  const size = "h-[26rem] w-full md:h-[32rem]";

  if (open) {
    return (
      <iframe
        title={title}
        src={src}
        referrerPolicy="no-referrer-when-downgrade"
        className={`block ${size} grayscale-[35%] sepia-[12%]`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`${size} group relative grid place-items-center overflow-hidden bg-sand text-moss`}
    >
      {/* Faint streets, with Milwaukee Avenue running across on the diagonal. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 [background-image:repeating-linear-gradient(0deg,transparent_0_46px,rgb(62_72_56/0.07)_46px_48px),repeating-linear-gradient(90deg,transparent_0_46px,rgb(62_72_56/0.07)_46px_48px)] opacity-60"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-3 w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] bg-cream/80"
      />
      <span className="relative flex flex-col items-center gap-4 px-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-moss text-cream shadow-[0_12px_30px_-12px_rgb(31_39_29/0.6)] transition-transform duration-500 ease-calm group-hover:-translate-y-1">
          <PinIcon className="size-6" />
        </span>
        <span className="font-display text-2xl">{address}</span>
        <span className="eyebrow text-sage-deep underline decoration-moss/30 underline-offset-4">
          Show the map
        </span>
      </span>
    </button>
  );
}
