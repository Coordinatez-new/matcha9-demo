/**
 * The site builds two ways: the full server app, and a static design preview for GitHub Pages
 * (`npm run build:pages`), where the same screens run on a demo store in the browser. These
 * helpers keep links and image URLs right in both.
 */

/** True in the GitHub Pages preview. */
export const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Files in /public and uploads, with the deploy base path in front (GitHub Pages serves the
 * preview from /<repo>/). next/link and next/router add it themselves; plain image URLs don't.
 */
export function imageSrc(src: string) {
  return src.startsWith("/") && !src.startsWith("//") ? `${basePath}${src}` : src;
}

/** A guest's order page. The preview can't have a page per order, so it uses a query string. */
export function orderHref(publicId: string) {
  return isStaticDemo
    ? `/order/?id=${encodeURIComponent(publicId)}`
    : `/order/${encodeURIComponent(publicId)}`;
}

/** The dashboard editor for one drink, with optional extra query parameters. */
export function adminItemHref(id: string, extra: Record<string, string> = {}) {
  const query = new URLSearchParams(isStaticDemo ? { id, ...extra } : extra).toString();
  const path = isStaticDemo ? "/admin/menu/edit/" : `/admin/menu/${encodeURIComponent(id)}`;
  return query ? `${path}?${query}` : path;
}
