import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Home, Phone } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { links, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4 pt-24 pb-16">
        <div className="max-w-lg text-center">
          <p className="text-7xl font-extrabold text-teal-700">404</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Aradığınız sayfa bulunamadı</h1>
          <p className="mt-3 text-slate-600">
            Sayfa taşınmış veya kaldırılmış olabilir. Anasayfadan devam edebilir ya da bize doğrudan ulaşabilirsiniz.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
            >
              <Home className="size-5" aria-hidden="true" /> Anasayfa
            </Link>
            <Link
              href={siteConfig.appointmentHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800"
            >
              <CalendarCheck className="size-5" aria-hidden="true" /> Randevu Al
            </Link>
          </div>
          <a href={links.tel} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
            <Phone className="size-4" aria-hidden="true" /> {siteConfig.phoneDisplay}
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
