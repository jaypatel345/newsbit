import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The dev server's disk cache (beta, on by default in Next 16) kept
    // serving stale globals.css after edits - even across restarts - until
    // .next/dev was deleted by hand.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
