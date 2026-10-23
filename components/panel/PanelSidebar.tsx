"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Clock,
  Home,
  LayoutDashboard,
  Menu,
  Tags,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

// İkonlar sunucu → istemci sınırından fonksiyon olarak geçemediği için isimle eşlenir
const ICONS = {
  dashboard: LayoutDashboard,
  appointments: ClipboardList,
  hours: Clock,
  patients: Users,
  services: Tags,
  book: CalendarPlus,
  myAppointments: CalendarCheck,
  calendar: CalendarClock,
  home: Home,
  account: UserCog,
} satisfies Record<string, LucideIcon>;

export type PanelNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** true ise yalnızca tam eşleşmede aktif görünür (ör. panel ana sayfası) */
  exact?: boolean;
};

type PanelSidebarProps = {
  title: string;
  userName: string;
  userEmail: string;
  items: PanelNavItem[];
  /** Çıkış butonu gibi sunucu bileşenleri */
  footer: React.ReactNode;
};

export default function PanelSidebar({ title, userName, userEmail, items, footer }: PanelSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: PanelNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const nav = (
    <nav aria-label={`${title} menüsü`} className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-teal-700 text-white shadow-sm" : "text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            }`}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      <div className="my-3 border-t border-slate-200" />
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <Home className="size-5 shrink-0" aria-hidden="true" />
        Ana Sayfaya Dön
      </Link>
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-teal-700 text-white">
        <Activity className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-slate-900">Fzt. Berkay Tan</span>
        <span className="text-xs font-medium text-teal-700">{title}</span>
      </span>
    </Link>
  );

  const userBox = (
    <div className="border-t border-slate-200 p-4">
      <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
      <p className="truncate text-xs text-slate-500">{userEmail}</p>
      <div className="mt-3">{footer}</div>
    </div>
  );

  return (
    <>
      {/* Mobil üst bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Menüyü aç"
          aria-expanded={open}
          aria-controls="panel-sidebar"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobil arka plan */}
      {open && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        id="panel-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-4">{nav}</div>
        {userBox}
      </aside>
    </>
  );
}
