"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, CalendarCheck, Menu, Phone, X } from "lucide-react";
import { links, navItems, siteConfig } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled || open ? "bg-white/95 shadow-sm backdrop-blur" : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold text-slate-900 sm:text-lg">{siteConfig.name}</span>
            <span className="text-[11px] font-medium text-teal-700 sm:text-xs">{siteConfig.unit}</span>
          </span>
        </Link>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={links.tel}
            className="hidden items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-800 xl:flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {siteConfig.phoneDisplay}
          </a>
          <Link
            href={siteConfig.appointmentHref}
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            Randevu Al
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="mobil-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      <nav
        id="mobil-menu"
        aria-label="Mobil menü"
        hidden={!open}
        className="border-t border-slate-200 bg-white lg:hidden"
      >
        <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="grid gap-2 pt-3 sm:grid-cols-2">
            <a
              href={links.tel}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-teal-700 px-5 py-3 font-semibold text-teal-800"
            >
              <Phone className="size-4" aria-hidden="true" /> Hemen Ara
            </a>
            <Link
              href={siteConfig.appointmentHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white"
            >
              <CalendarCheck className="size-4" aria-hidden="true" /> Randevu Al
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
