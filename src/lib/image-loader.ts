import type { ImageLoaderProps } from "next/image";

/**
 * Image URLs for the static design preview. GitHub Pages has no image optimiser, so
 * `scripts/export-images.mjs` writes every photo at each configured width after the build
 * (`/_img/<width>/<path>`), and this loader points next/image's srcset at those files. Phones get
 * a phone-sized photo instead of the original. The server build uses Next's own optimiser.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function staticImageLoader({ src, width }: ImageLoaderProps) {
  // data: and blob: URLs (dashboard uploads) and other origins are used as they are.
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  // The dev server has no exported sizes: serve the original (the width only keeps URLs apart).
  if (process.env.NODE_ENV !== "production") return `${src}?w=${width}`;
  const path = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  return `${basePath}/_img/${width}${path}`;
}
