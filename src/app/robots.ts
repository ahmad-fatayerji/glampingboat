import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXTAUTH_URL ?? "https://glampingboat.fr"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
