import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { links, siteConfig } from "@/lib/site";

export default function Contact() {
  const items = [
    {
      icon: MapPin,
      label: "Adres",
      value: siteConfig.address.full,
      href: links.mapsDirections,
      external: true,
    },
    { icon: Phone, label: "Telefon / WhatsApp", value: siteConfig.phoneDisplay, href: links.tel },
    { icon: Mail, label: "E-posta", value: siteConfig.email, href: links.mail },
    { icon: Clock, label: "Randevu", value: "Randevu için arayın veya WhatsApp’tan yazın." },
  ];

  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">İletişim & Konum</p>
          <h2
            id="iletisim-baslik"
            className="mt-3 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl"
          >
            Bize Ulaşın
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Sorularınız ve randevu talepleriniz için bize telefon, WhatsApp veya e-posta ile
            ulaşabilirsiniz.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <address className="not-italic">
              <ul className="space-y-6">
                {items.map(({ icon: Icon, label, value, href, external }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="font-semibold break-words text-slate-900 hover:text-teal-800"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="font-semibold text-slate-900">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </address>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a
                href={links.tel}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                <Phone className="size-4" aria-hidden="true" /> Ara
              </a>
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
              </a>
              <a
                href={links.mail}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
              >
                <Mail className="size-4" aria-hidden="true" /> E-posta
              </a>
            </div>
          </div>

          {/* Gömülü harita yok: sayfa açılışında Google'a veri gitmez (Çerez Politikası m.3). Harita yalnızca linkle açılır. */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 text-white shadow-sm">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <MapPin className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold">Konum</h3>
              <p className="mt-2 leading-relaxed text-teal-50">{siteConfig.address.full}</p>
              <p className="mt-4 text-sm text-teal-100">Alibeyköy merkezde, Güzelyayla Caddesi üzerinde.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href={links.mapsSearch}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                <MapPin className="size-4" aria-hidden="true" /> Haritada Aç
              </a>
              <a
                href={links.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Navigation className="size-4" aria-hidden="true" /> Yol Tarifi Al
              </a>
            </div>
            <p className="mt-4 text-xs text-teal-100/80">Bağlantılar Google Haritalar&apos;ı yeni sekmede açar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
