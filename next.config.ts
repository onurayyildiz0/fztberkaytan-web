import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy
 * - script/style 'unsafe-inline': Next.js App Router sayfaya satır içi script (hydration verisi)
 *   ve JSON-LD ekler. Nonce tabanlı CSP tüm sayfaları dinamik render'a zorlayacağı için tercih edilmedi.
 * - 'unsafe-eval' yalnızca geliştirme ortamında (React hata ayıklama araçları için) eklenir.
 * - frame-src: Anasayfadaki Google Haritalar gömülü haritası.
 * - frame-ancestors 'none': Site başka bir sitenin içine gömülemez (clickjacking koruması).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Eski tarayıcılar için clickjacking koruması (CSP frame-ancestors ile aynı)
  { key: "X-Frame-Options", value: "DENY" },
  // Tarayıcının dosya türünü tahmin etmesini engeller
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Başka sitelere yalnızca alan adı gönderilir (URL'deki token/parametreler sızmaz)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Kullanılmayan tarayıcı özellikleri kapatılır
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  // Başka pencerelerin bu sayfaya erişimini keser
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Yalnızca HTTPS (1 yıl). Tarayıcılar HTTP/localhost üzerinde bu başlığı yok sayar.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
