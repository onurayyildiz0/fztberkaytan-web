import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SERVICES } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "fizyoterapist",
    "Eyüpsultan fizyoterapi",
    "Alibeyköy fizyoterapist",
    "klinik pilates",
    "fizik tedavi",
    "rehabilitasyon",
    "ortopedik rehabilitasyon",
    "nörolojik rehabilitasyon",
    "Berkay Tan",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Physiotherapy", "MedicalBusiness", "LocalBusiness"],
  "@id": `${siteConfig.url}/#business`,
  name: `${siteConfig.name} – ${siteConfig.unit}`,
  description: siteConfig.description,
  url: siteConfig.url,
  image: `${siteConfig.url}/og-image.jpg`,
  telephone: siteConfig.phoneE164,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.district,
    addressRegion: siteConfig.address.city,
    addressCountry: siteConfig.address.countryCode,
  },
  areaServed: [
    { "@type": "Place", name: "Eyüpsultan" },
    { "@type": "Place", name: "Alibeyköy" },
    { "@type": "City", name: "İstanbul" },
  ],
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.full)}`,
  medicalSpecialty: "Physiotherapy",
  // Hizmet listesi tek kaynaktan (lib/services.ts) gelir
  availableService: SERVICES.map((s) => ({ "@type": "MedicalTherapy", name: s.name, description: s.description })),
  founder: {
    "@type": "Person",
    name: "Berkay Tan",
    jobTitle: "Fizyoterapist",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
