import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { legalLinks, siteConfig } from "@/lib/site";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type LegalPageProps = {
  title: string;
  intro?: React.ReactNode;
  lastUpdated?: string;
  sections: LegalSection[];
  currentPath: string;
};

/** Yasal sayfalar için ortak metadata (title, description, canonical, OG) */
export function legalMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    // Kök layout'taki "%s | Fizyoterapist Berkay Tan" şablonu tam başlığı oluşturur
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: { card: "summary", title: `${title} | ${siteConfig.name}`, description },
  };
}

export default function LegalPage({ title, intro, lastUpdated, sections, currentPath }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="bg-slate-50 pt-16 lg:pt-20">
        <div className="border-b border-slate-200 bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <nav aria-label="Sayfa konumu" className="flex items-center gap-1.5 text-sm text-slate-500">
              <Link href="/" className="hover:text-teal-700">
                Anasayfa
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span aria-current="page" className="text-slate-700">
                {title}
              </span>
            </nav>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">{title}</h1>
            {lastUpdated && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="size-4 text-teal-700" aria-hidden="true" />
                Son Güncelleme: <time>{lastUpdated}</time>
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr] lg:gap-12 lg:px-8 lg:py-14">
          {/* İçindekiler */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="İçindekiler" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">İçindekiler</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2 text-slate-700 hover:text-teal-700">
                      <span className="w-5 shrink-0 font-semibold text-teal-700 tabular-nums">{i + 1}.</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <nav aria-label="Diğer yasal metinler" className="mt-4 hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:block">
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Yasal Metinler</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={l.href === currentPath ? "page" : undefined}
                      className={l.href === currentPath ? "font-semibold text-teal-700" : "text-slate-700 hover:text-teal-700"}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            {intro && <div className="mb-10 space-y-4 text-[15px] leading-7 text-slate-700">{intro}</div>}
            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-baslik`} className="scroll-mt-28">
                  <h2 id={`${s.id}-baslik`} className="flex gap-3 text-xl font-bold text-slate-900">
                    <span className="text-teal-700 tabular-nums">{i + 1}.</span>
                    <span>{s.title}</span>
                  </h2>
                  <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">{s.content}</div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
