import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, Clock } from "lucide-react";
import { Card, PageHeader } from "@/components/panel/ui";
import { SERVICE_ICONS } from "@/components/serviceIcons";
import { SERVICES, formatPrice } from "@/lib/services";
import { links, siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Hizmetler ve Fiyatlar" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Hizmetler ve Fiyatlar" description="Kliniğimizde sunulan hizmetler ve güncel seans ücretleri." />

      <div className="grid gap-5 md:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = SERVICE_ICONS[service.slug];
          return (
            <Card key={service.slug} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[546/366] bg-slate-100 sm:aspect-[2/1]">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{service.name}</h2>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock className="size-4" aria-hidden="true" /> {service.durationMinutes} dakika
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Seans ücreti</p>
                    <p className={service.price === null ? "text-sm font-medium text-slate-700" : "text-xl font-bold text-slate-900"}>
                      {formatPrice(service.price)}
                    </p>
                  </div>
                  <Link
                    href={`/hasta-paneli/randevu-al?hizmet=${service.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    <CalendarPlus className="size-4" aria-hidden="true" />
                    Bu Hizmet İçin Randevu Al
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Fiyatlar ve paket seçenekleri hakkında bilgi için{" "}
        <a href={links.tel} className="font-medium text-teal-700 hover:underline">
          {siteConfig.phoneDisplay}
        </a>{" "}
        numarasından bize ulaşabilirsiniz.
      </p>
    </>
  );
}
