import type { AnchorId } from "./scene";

/**
 * The build as still frames, rendered from the 3D scene by scripts/render-drink-stills.mjs
 * (rerun it after changing the scene). The home page shows these first, and for good on
 * devices that don't get the live 3D. Generated: don't edit by hand.
 */

/** The studio's environment map, baked from the scene; its values are scaled down by `scale`. */
export const bakedEnvironment = { src: "/images/drink-build/studio.webp", scale: 4.1914 };

export const stillSize = { width: 960, height: 1200 };

export const stillFrames: { at: number; src: string }[] = [
  { at: 0, src: "/images/drink-build/still-0.webp" },
  { at: 0.18, src: "/images/drink-build/still-1.webp" },
  { at: 0.28, src: "/images/drink-build/still-2.webp" },
  { at: 0.36, src: "/images/drink-build/still-3.webp" },
  { at: 0.52, src: "/images/drink-build/still-4.webp" },
  { at: 0.65, src: "/images/drink-build/still-5.webp" },
  { at: 0.77, src: "/images/drink-build/still-6.webp" },
  { at: 0.87, src: "/images/drink-build/still-7.webp" },
  { at: 1, src: "/images/drink-build/still-8.webp" },
];

/** Where each layer's name sits on the last frame, as fractions of its width and height. */
export const stillAnchors: Record<AnchorId, [number, number]> = {
  finish: [0.5, 0.1293],
  foam: [0.5, 0.2219],
  pistachio: [0.5, 0.3374],
  milk: [0.5, 0.4783],
  matcha: [0.5, 0.7418],
};
