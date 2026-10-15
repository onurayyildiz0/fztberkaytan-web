import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, ShieldCheck, Target } from "lucide-react";
import { siteConfig } from "@/lib/site";

type HeroProps = {
  /** Klinik dışı / tabela görseli, ör. "/images/klinik-tabela.jpg" (public/ altına ekleyin) */
  imageSrc?: string;
  imageAlt?: string;
};

export default function Hero({
  imageSrc,
  imageAlt = "Fizyoterapist Berkay Tan, Eyüpsultan Alibeyköy’deki Özel Sağlık Meslek Hizmet Birimi’nin girişinde",
}: HeroProps) {
  return (
    <section
      id="anasayfa"
      aria-labelledby="hero-baslik"
      className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-teal-200/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-teal-800 shadow-sm ring-1 ring-teal-100">
            <MapPin className="size-4" aria-hidden="true" />
            Eyüpsultan · Alibeyköy
          </p>
          <h1
            id="hero-baslik"
            className="mt-6 text-4xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Eyüpsultan&apos;da <span className="text-teal-700">Kişiye Özel</span> Fizyoterapi ve
            Rehabilitasyon
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Sağlıklı ve ağrısız bir yaşam için fonksiyonel hedeflerinize uygun bireysel tedavi ve
            egzersiz programları.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteConfig.appointmentHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <CalendarCheck className="size-5" aria-hidden="true" />
              Randevu Al
            </Link>
            <a
              href="#hizmetler"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
            >
              Hizmetlerimizi İnceleyin
              <ArrowRight className="size-5" aria-hidden="true" />
            </a>
          </div>
          <ul className="mt-10 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
              {siteConfig.unit}
            </li>
            <li className="flex items-center gap-3">
              <Target className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
              Fonksiyonel hedef odaklı bireysel program
            </li>
          </ul>
        </div>

        {/* Görsel alanı: imageSrc verildiğinde klinik dışı / tabela fotoğrafı gösterilir */}
        <div className="relative">
          <div className="relative aspect-[1152/1070] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-900 shadow-2xl ring-1 ring-slate-900/5">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white">
                <p className="text-xs font-medium tracking-[0.2em] text-teal-100 uppercase sm:text-sm">
                  {siteConfig.unit}
                </p>
                <p className="mt-3 text-3xl font-bold sm:text-4xl">{siteConfig.name}</p>
                <p className="mt-4 text-teal-100">Fizyoterapi · Rehabilitasyon · Klinik Pilates</p>
              </div>
            )}
          </div>
          {/* <div className="absolute -bottom-6 left-6 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 sm:block">
            <p className="text-xs font-medium text-slate-500">Rehabilitasyon alanları</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Ortopedik · Nörolojik · Pediatrik · Geriatrik
            </p>
          </div> */}
        </div>
      </div>
    </section>
  );
}
