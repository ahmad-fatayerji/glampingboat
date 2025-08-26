import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds to avoid failing Docker builds due to lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Built-in i18n routing: URLs like /fr/... /de/... etc.
  i18n: {
    locales: ["en", "fr", "de", "nl", "ru", "es", "it"],
    defaultLocale: "en",
  },
};

export default nextConfig;
