import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Separate build output for isolated browser tests; normal builds are unchanged. */
  distDir: process.env.CMS_E2E === "1" ? ".next-cms-e2e" : ".next",
  experimental: {
    agentFeedback: true,
    serverActions: { bodySizeLimit: "128kb" },
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ] }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
