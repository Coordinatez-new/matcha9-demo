import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 *
 * GitHub Pages serves a project site from `/<repo-name>/`. The deploy workflow passes that
 * prefix in `PAGES_BASE_PATH` (from actions/configure-pages). Locally it is empty, so
 * `npm run dev` and `npm run build` work at the root.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // The default loader needs a server; images are pre-optimised at build time instead.
    unoptimized: true,
  },
  env: {
    // Needed for `/public` URLs (video, OG images) that next/link and static imports don't cover.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
