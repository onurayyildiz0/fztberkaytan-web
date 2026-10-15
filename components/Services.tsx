import Image from "next/image";
import { SERVICE_ICONS } from "@/components/serviceIcons";
import { SERVICES } from "@/lib/services";

export default function Services() {
  return (
    <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">Hizmetlerimiz</p>
          <h2
            id="hizmetler-baslik"
            className="mt-3 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl"
          >
            Size Özel Planlanan Fizyoterapi Hizmetleri
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Değerlendirmeden tedaviye kadar her adım, ihtiyaçlarınız ve hedefleriniz doğrultusunda
            planlanır.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.slug];
            return (
              <li key={service.slug}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
                  <div className="relative aspect-[546/366] overflow-hidden bg-slate-100">
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-teal-800 shadow-sm backdrop-blur"
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <div className="relative flex flex-1 flex-col p-6 pt-9">
                    <span className="absolute -top-6 left-6 flex size-12 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg ring-4 ring-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
