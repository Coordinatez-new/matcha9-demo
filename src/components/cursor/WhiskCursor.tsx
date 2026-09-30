"use client";

import { useEffect } from "react";

/**
 * Swaps the pointer for a small 3D matcha whisk on devices with a mouse. Touch screens, guests
 * who prefer reduced motion or save data, and anyone without a hardware GPU keep their normal
 * cursor. The 3D code loads only once the mouse moves and the browser is idle, so it never
 * competes with the page loading.
 */
export function WhiskCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (!finePointer.matches || reducedMotion.matches || saveData) return;

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
    let idle = 0;
    const onFirstMove = () => {
      idle = hasIdle
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : window.setTimeout(start, 300);
    };
    window.addEventListener("pointermove", onFirstMove, { once: true, passive: true });

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
      window.removeEventListener("pointermove", onFirstMove);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      reducedMotion.removeEventListener("change", onChange);
      finePointer.removeEventListener("change", onChange);
      handle?.destroy();
    };
  }, []);

  return null;
}
