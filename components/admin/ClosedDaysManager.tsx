"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, LoaderCircle, Trash2 } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import { Card } from "@/components/panel/ui";
import { formatDateLong, todayKey } from "@/lib/dates";

type ClosedDay = { id: string; date: string; reason: string };

/** Tatil / izin günlerini randevuya kapatma */
export default function ClosedDaysManager({ initial }: { initial: ClosedDay[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/closed-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; existingAppointments?: number };
      setAlert({ type: res.ok ? (data.existingAppointments ? "error" : "success") : "error", message: data.message ?? "Kaydedilemedi." });
      if (res.ok) {
        setDate("");
        setReason("");
        router.refresh();
      }
    } catch {
      setAlert({ type: "error", message: "Sunucuya ulaşılamadı." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setRemoving(id);
    setAlert(null);
    const res = await fetch(`/api/admin/closed-days/${id}`, { method: "DELETE" }).catch(() => null);
    setRemoving(null);
    if (res?.ok) router.refresh();
    else setAlert({ type: "error", message: "Silinemedi." });
  }

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <CalendarOff className="size-5 text-red-500" aria-hidden="true" /> Kapalı Günler
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Tatil, izin veya kongre gibi günleri tek seferlik kapatın. Bu günlerde haftalık çalışma saatleri geçerli olmaz ve hastalar
        randevu alamaz.
      </p>

      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="kapali-tarih" className="block text-xs font-medium text-slate-600">
            Tarih
          </label>
          <input
            id="kapali-tarih"
            type="date"
            min={todayKey()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="kapali-neden" className="block text-xs font-medium text-slate-600">
            Açıklama (isteğe bağlı)
          </label>
          <input
            id="kapali-neden"
            value={reason}
            maxLength={120}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Örn. Resmî tatil, yıllık izin"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !date}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          Günü Kapat
        </button>
      </form>

      {alert && (
        <div className="mt-3">
          <FormAlert type={alert.type} message={alert.message} />
        </div>
      )}

      {initial.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
          {initial.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0 text-sm">
                <span className="font-semibold text-slate-900">{formatDateLong(d.date)}</span>
                {d.reason && <span className="text-slate-500"> · {d.reason}</span>}
              </span>
              <button
                type="button"
                onClick={() => remove(d.id)}
                disabled={removing === d.id}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label={`${formatDateLong(d.date)} kapalı günü kaldır`}
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> Aç
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
