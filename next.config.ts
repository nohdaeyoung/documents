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
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "CDN-Cache-Control", value: "no-cache" },
          { key: "Vercel-CDN-Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
