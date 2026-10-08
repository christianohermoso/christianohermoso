import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/advertising`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];
}
