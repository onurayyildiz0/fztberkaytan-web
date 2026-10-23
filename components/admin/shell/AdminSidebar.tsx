"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  DatabaseBackup,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  exact?: boolean;
  /** Henüz geliştirilmemiş modül */
  soon?: boolean;
  children?: NavChild[];
};

export const ADMIN_NAV: NavItem[] = [
  { label: "Genel Bakış", icon: LayoutDashboard, href: "/admin", exact: true },
  {
    label: "Randevular",
    icon: CalendarDays,
    children: [
      { label: "Takvim", href: "/admin/takvim" },
      { label: "Tüm Randevular", href: "/admin/randevular" },
      { label: "Bekleyen Talepler", href: "/admin/randevular?durum=pending" },
      { label: "Yeni Randevu", href: "/admin/randevular/yeni" },
      { label: "Çalışma Saatleri", href: "/admin/calisma-saatleri" },
    ],
  },
  {
    label: "Hastalar",
    icon: Users,
    children: [
      { label: "Hasta Listesi", href: "/admin/hastalar" },
      { label: "Yeni Hasta", href: "/admin/hastalar/yeni" },
    ],
  },
  { label: "Belgeler", icon: FileText, href: "/admin/belgeler", soon: true },
  { label: "Finans", icon: Wallet, href: "/admin/finans", soon: true },
  { label: "Raporlar", icon: BarChart3, href: "/admin/raporlar", soon: true },
  { label: "Hizmet Raporu", icon: ClipboardList, href: "/admin/hizmet-raporu", soon: true },
  { label: "Ayarlar", icon: Settings, href: "/admin/ayarlar", soon: true },
];

type AdminSidebarProps = {
  userName: string;
  userInitials: string;
  /** Çıkış butonu (sunucu bileşeni) */
  signOut: React.ReactNode;
};

export default function AdminSidebar({ userName, userInitials, signOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isChildActive = (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const params = new URLSearchParams(query ?? "");
    if (params.size === 0) {
      // "Tüm Randevular": durum filtresi "pending" iken "Bekleyen Talepler" aktif görünsün
      return searchParams.get("durum") !== "pending";
    }
    return [...params].every(([k, v]) => searchParams.get(k) === v);
  };

  const isItemActive = (item: NavItem) => {
    if (item.children) return item.children.some((c) => pathname === c.href.split("?")[0] || pathname.startsWith(`${c.href.split("?")[0]}/`));
    if (!item.href) return false;
    return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_NAV.filter((i) => i.children).map((i) => [i.label, isItemActive(i)])),
  );

  useEffect(() => {
    setMobileOpen(false);
    // Aktif sayfanın grubunu açık tut
    setOpenGroups((g) => {
      const next = { ...g };
      for (const item of ADMIN_NAV) if (item.children && isItemActive(item)) next[item.label] = true;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-teal-800 shadow-sm">
        <Activity className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-bold text-white">Fzt. Berkay Tan</span>
        <span className="text-[10px] font-medium tracking-[0.18em] text-teal-200 uppercase">Klinik Paneli</span>
      </span>
    </Link>
  );

  const itemBase = "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition";

  const nav = (
    <nav aria-label="Yönetim menüsü" className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item);

        if (item.children) {
          const open = openGroups[item.label] ?? false;
          const groupId = `nav-${item.label}`;
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpenGroups((g) => ({ ...g, [item.label]: !open }))}
                aria-expanded={open}
                aria-controls={groupId}
                className={`${itemBase} ${active ? "text-white" : "text-teal-50/85 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <ul id={groupId} hidden={!open} className="mt-1 mb-2 ml-6 space-y-0.5 border-l border-white/15 pl-3">
                {item.children.map((child) => {
                  const childActive = isChildActive(child.href);
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={childActive ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          childActive ? "bg-white/15 font-semibold text-white" : "text-teal-100/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            aria-current={active ? "page" : undefined}
            className={`${itemBase} ${
              active ? "bg-teal-500/90 text-white shadow-lg shadow-teal-950/30" : "text-teal-50/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.soon && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-100/80">
                Yakında
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/10 pt-4">
      <a
        href="/api/admin/backup"
        download
        className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-teal-50/85 transition hover:bg-white/10 hover:text-white"
      >
        <DatabaseBackup className="size-4" aria-hidden="true" />
        Yedek Al
      </a>
      {signOut}
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-900">
          {userInitials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{userName}</span>
          <span className="block text-xs text-teal-200">Fizyoterapist</span>
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobil üst bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-teal-900 px-4 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
          aria-label="Menüyü aç"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-teal-900 to-teal-950 px-4 py-5 transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-1">
          {brand}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-teal-100 hover:bg-white/10 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto pr-1">{nav}</div>
        {footer}
      </aside>
    </>
  );
}
