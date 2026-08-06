import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXTAUTH_URL ?? "https://glampingboat.fr"
).replace(/\/$/, "");

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/terms", priority: 0.4 },
  { path: "/cookies", priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
