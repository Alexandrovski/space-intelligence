import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/dashboard.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};
export default nextConfig;
