import Link from "next/link";
import { Activity, Mail, MapPin, Phone } from "lucide-react";
import { legalLinks, links, navItems, siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">{siteConfig.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            {siteConfig.unit} – {siteConfig.name}. Eyüpsultan Alibeyköy’de kişiye özel fizyoterapi,
            rehabilitasyon ve klinik pilates hizmetleri.
          </p>
        </div>

        <nav aria-label="Hızlı erişim">
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase">Hızlı Erişim</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition hover:text-teal-300">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Yasal bağlantılar">
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase">Yasal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-teal-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase">İletişim</h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-400" aria-hidden="true" />
              <span>{siteConfig.address.full}</span>
            </p>
            <p>
              <a href={links.mail} className="flex items-center gap-3 transition hover:text-teal-300">
                <Mail className="size-4 shrink-0 text-teal-400" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </p>
            <p>
              <a href={links.tel} className="flex items-center gap-3 transition hover:text-teal-300">
                <Phone className="size-4 shrink-0 text-teal-400" aria-hidden="true" />
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © 2026 {siteConfig.name}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
