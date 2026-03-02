import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/archives/:slug.html",
        destination: "/archives/:slug",
      },
    ];
  },
};

export default nextConfig;
