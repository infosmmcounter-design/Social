import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid intermittent ENOENT build-manifest races under concurrent writes
  experimental: {
    // Keep empty — reserved for future flags
  },
  // Production preview is more reliable than Turbopack HMR in this environment
  poweredByHeader: false,
};

export default nextConfig;
