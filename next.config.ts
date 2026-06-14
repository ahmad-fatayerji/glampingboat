import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
