/**
 * Prefix a `/public` path with the deploy base path.
 *
 * GitHub Pages serves the site from `/<repo-name>/`. `next/link` and statically imported
 * images get the prefix automatically; plain URLs (videos, files in /public) do not.
 */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
