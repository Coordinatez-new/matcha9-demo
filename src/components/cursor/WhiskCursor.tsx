"use client";

import { useEffect } from "react";

/**
 * Swaps the pointer for a small 3D matcha whisk on devices with a mouse. Touch screens and
 * guests who prefer reduced motion keep their normal cursor, and so does anyone without WebGL.
 * The 3D code loads after the page is idle, so it never competes with the first paint.
 */
export function WhiskCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let handle: { destroy: () => void } | null = null;
    let cancelled = false;
    const start = () => {
      import("./whisk-scene")
        .then(({ mountWhisk }) => {
          if (!cancelled) handle = mountWhisk();
        })
        .catch(() => {
          // The native cursor simply stays.
        });
    };

    // Safari has no requestIdleCallback; a short timeout does the same job there.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 800);

    const onChange = () => {
      if (reducedMotion.matches || !finePointer.matches) {
        handle?.destroy();
        handle = null;
      }
    };
    reducedMotion.addEventListener("change", onChange);
    finePointer.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      reducedMotion.removeEventListener("change", onChange);
      finePointer.removeEventListener("change", onChange);
      handle?.destroy();
    };
  }, []);

  return null;
}
