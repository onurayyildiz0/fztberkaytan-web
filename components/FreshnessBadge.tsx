"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { formatDateLong, todayKey } from "@/lib/dates";

/**
 * Sağ altta "Son güncelleme" rozeti: her ayın 1'inde kendiliğinden yeni aya geçer.
 * Tarih tarayıcıda (İstanbul saatine göre) hesaplanır; statik sayfalarda build tarihinde donmaz.
 */
export default function FreshnessBadge() {
  const [month, setMonth] = useState<{ iso: string; label: string } | null>(null);

  useEffect(() => {
    const monthStart = `${todayKey().slice(0, 7)}-01`;
    // "1 Ekim 2026 Perşembe" → "1 Ekim 2026"
    setMonth({ iso: monthStart, label: formatDateLong(monthStart).split(" ").slice(0, 3).join(" ") });
  }, []);

  if (!month) return null;

  return (
    <div
      className="pointer-events-none fixed right-3 bottom-3 z-40 sm:right-5 sm:bottom-5"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <p className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-md ring-1 ring-slate-200 backdrop-blur">
        <BadgeCheck className="size-3.5 text-teal-600" aria-hidden="true" />
        Son güncelleme: <time dateTime={month.iso}>{month.label}</time>
      </p>
    </div>
  );
}
