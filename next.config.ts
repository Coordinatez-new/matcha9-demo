import type { NextConfig } from "next";

/**
 * One codebase, two builds.
 *
 * - The site (default): server-rendered, with the database, dashboard sign-in, pickup ordering
 *   and Toast. Route files ending in `.server.tsx` belong to this build.
 * - The design preview (`npm run build:pages`, or STATIC_DEMO=1): a static export for GitHub
 *   Pages. The same screens run on a demo store in the browser, so the dashboard, bag and
 *   checkout all work without a server. Route files ending in `.static.tsx` belong to it.
 *
 * Plain `page.tsx` / `layout.tsx` files are shared by both.
 */
const lifecycle = process.env.npm_lifecycle_event ?? "";
const staticPreview = process.env.STATIC_DEMO === "1" || lifecycle.endsWith(":pages");

// GitHub Pages serves a project site from /<repo>/; the deploy workflow passes that prefix.
const basePath = staticPreview ? (process.env.PAGES_BASE_PATH ?? "") : "";

const site: NextConfig = {
  pageExtensions: ["server.tsx", "server.ts", "tsx", "ts"],
  // PGlite (the embedded Postgres used when there's no DATABASE_URL) loads its WebAssembly
  // build from disk at runtime, so it stays out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Photo uploads from the dashboard (images up to 10 MB, plus form overhead).
      bodySizeLimit: "11mb",
    },
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  },
};

const preview: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  pageExtensions: ["static.tsx", "static.ts", "tsx", "ts"],
  images: {
    // Static hosting has no image optimiser; the photos are already web-sized.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_STATIC_DEMO: "1",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  poweredByHeader: false,
};

export default staticPreview ? preview : site;
