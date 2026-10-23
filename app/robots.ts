import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** /robots.txt — paneller, API ve hesap sayfaları taranmaz */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/hasta-paneli",
        "/api/",
        "/giris-yap",
        "/kayit-ol",
        "/sifremi-unuttum",
        "/sifre-sifirla",
        "/e-posta-dogrula",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
