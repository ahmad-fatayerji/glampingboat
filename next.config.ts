import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  ...(process.env.NODE_ENV !== "production" &&
  process.env.ACCOUNT_SECURITY_DEV_DOMAIN === "true"
    ? { allowedDevOrigins: ["glampingboat.fr"] }
    : {}),
  images: {
    qualities: [74, 75, 76, 88],
  },
  async headers() {
    return [
      {
        source: "/images/:section/optimized/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
