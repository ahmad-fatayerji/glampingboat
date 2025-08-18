import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds to avoid failing Docker builds due to lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
