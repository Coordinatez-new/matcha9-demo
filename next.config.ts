import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
