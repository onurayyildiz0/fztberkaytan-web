import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** /sitemap.xml — arama motorlarına yalnızca herkese açık sayfalar bildirilir */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const lastModified = new Date("2026-10-19");
  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/kvkk`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/gizlilik-politikasi`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cerez-politikasi`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
