import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { links, siteConfig } from "@/lib/site";

/** Yasal metinlerde tutarlı tipografi için küçük yardımcı bileşenler */

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Term({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-slate-900">{children}</strong>;
}

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:decoration-teal-700">
      {children}
    </Link>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900 ring-1 ring-teal-100">{children}</div>;
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Veri sorumlusu / iletişim kartı */
export function ContactCard({ title = "Veri Sorumlusu" }: { title?: string }) {
  const website = siteConfig.url.replace(/\/?$/, "/");
  return (
    <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
      <p className="mt-1 font-semibold text-slate-900">Fizyoterapist Berkay TAN — {siteConfig.unit}</p>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
          <span>{siteConfig.address.full}</span>
        </li>
        <li className="flex gap-2.5">
          <Phone className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
          <a href={links.tel} className="hover:text-teal-700">
            {siteConfig.phoneDisplay}
          </a>
        </li>
        <li className="flex gap-2.5">
          <Mail className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
          <a href={links.mail} className="hover:text-teal-700">
            {siteConfig.email}
          </a>
        </li>
        <li className="flex gap-2.5">
          <Globe className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
          <a href={siteConfig.url} className="hover:text-teal-700">
            {website}
          </a>
        </li>
      </ul>
    </div>
  );
}

/**
 * Avukat metnindeki "[YAYIN ÖNCESİ]" notları: bilgisi doğrulanıp metin tamamlanana kadar görünür kalır.
 * Listesi lib/legal.ts → LEGAL_PENDING_ITEMS içinde tutulur.
 */
export function PendingNote({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      <p className="text-xs font-bold tracking-wider text-amber-700 uppercase">Yayın öncesi tamamlanacak</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
