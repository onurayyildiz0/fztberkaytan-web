"use client";

import { useEffect, useState } from "react";
import { CalendarSync, LoaderCircle } from "lucide-react";

type Status = { configured: boolean; ok: boolean; message: string };

/** Google Takvim bağlantı durumu rozeti */
export default function GoogleCalendarStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/admin/google-calendar")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, ok: false, message: "Durum alınamadı." }));
  }, []);

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> Google Takvim
      </span>
    );
  }

  const tone = status.ok
    ? "bg-blue-50 text-blue-800 ring-blue-200"
    : status.configured
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <span title={status.message} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${tone}`}>
      <CalendarSync className="size-3.5" aria-hidden="true" />
      {status.ok ? "Google Takvim bağlı" : status.configured ? "Google Takvim hatası" : "Google Takvim bağlı değil"}
    </span>
  );
}
