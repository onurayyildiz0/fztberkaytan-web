"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarOff, Plus } from "lucide-react";
import AppointmentDetailDialog from "@/components/admin/AppointmentDetailDialog";
import { StatusBadge } from "@/components/panel/ui";
import { SLOT_DURATION_MINUTES, STATUS_BLOCK_CLASSES, type AdminAppointmentDTO } from "@/lib/appointments";
import { WEEKDAYS, addDays, dayOfWeek, formatDateShort, nowMinutes, timeToMinutes, todayKey, type DateKey } from "@/lib/dates";

type Props = {
  weekStart: DateKey;
  appointments: AdminAppointmentDTO[];
  /** dayOfWeek → çalışma slotları (kapalı gün için boş) */
  workingSlots: Record<number, string[]>;
  closedDays: Record<DateKey, string>;
};

const HOUR_HEIGHT = 64; // px

export default function WeekCalendar({ weekStart, appointments, workingSlots, closedDays }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = todayKey();

  // Saat aralığı: çalışma saatleri ve randevuları kapsar (varsayılan 08:00 – 20:00)
  const starts = [
    ...Object.values(workingSlots).flat().map(timeToMinutes),
    ...appointments.map((a) => timeToMinutes(a.timeSlot.split(" - ")[0]!)),
  ];
  const minHour = Math.min(8, ...starts.map((m) => Math.floor(m / 60)));
  const maxHour = Math.max(20, ...starts.map((m) => Math.ceil((m + SLOT_DURATION_MINUTES) / 60)));
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);

  // Şu anki saat çizgisi
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(nowMinutes());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const byDay = (key: DateKey) =>
    appointments.filter((a) => a.date === key).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return (
    <>
      {/* Masaüstü: haftalık ızgara */}
      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:block">
        <div className="grid min-w-[960px]" style={{ gridTemplateColumns: "4rem repeat(7, minmax(0, 1fr))" }}>
          <div className="border-b border-slate-200" />
          {days.map((key) => {
            const isToday = key === today;
            const label = WEEKDAYS.find((w) => w.value === dayOfWeek(key))!;
            return (
              <div key={key} className={`border-b border-l border-slate-200 px-2 py-3 text-center ${isToday ? "bg-teal-50" : ""}`}>
                <p className={`text-xs font-semibold uppercase ${isToday ? "text-teal-700" : "text-slate-500"}`}>{label.short}</p>
                <p className={`text-lg font-bold ${isToday ? "text-teal-800" : "text-slate-900"}`}>{Number(key.slice(8))}</p>
                {closedDays[key] !== undefined && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-red-600" title={closedDays[key]}>
                    Kapalı{closedDays[key] ? `: ${closedDays[key]}` : ""}
                  </p>
                )}
              </div>
            );
          })}

          {/* Saat etiketleri */}
          <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
            {hours.map((h, i) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-slate-400 tabular-nums" style={{ top: i * HOUR_HEIGHT }}>
                {i === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>

          {days.map((key) => {
            const closed = closedDays[key] !== undefined;
            const slots = closed ? [] : (workingSlots[dayOfWeek(key)] ?? []);
            const dayItems = byDay(key);
            const isPastDay = key < today;
            return (
              <div
                key={key}
                className={`relative border-l border-slate-200 ${closed ? "bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_8px,#f1f5f9_8px,#f1f5f9_16px)]" : slots.length === 0 ? "bg-slate-50/70" : ""}`}
                style={{ height: hours.length * HOUR_HEIGHT }}
              >
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
                ))}

                {/* Boş çalışma slotları → yeni randevu */}
                {!isPastDay &&
                  slots
                    .filter((s) => !dayItems.some((a) => a.timeSlot.startsWith(s) && a.status !== "cancelled" && a.status !== "rejected"))
                    .filter((s) => key !== today || now === null || timeToMinutes(s) > now)
                    .map((s) => (
                      <Link
                        key={s}
                        href={`/admin/randevular/yeni?tarih=${key}&saat=${s}`}
                        title={`${s} – yeni randevu`}
                        className="group absolute inset-x-1 flex items-center justify-center rounded-md border border-dashed border-teal-200 text-xs text-teal-700 opacity-60 transition hover:border-teal-400 hover:bg-teal-50 hover:opacity-100"
                        style={{ top: ((timeToMinutes(s) - minHour * 60) / 60) * HOUR_HEIGHT + 2, height: (SLOT_DURATION_MINUTES / 60) * HOUR_HEIGHT - 4 }}
                      >
                        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Plus className="size-3" aria-hidden="true" /> {s}
                        </span>
                      </Link>
                    ))}

                {/* Randevular */}
                {dayItems.map((a) => {
                  const start = timeToMinutes(a.timeSlot.split(" - ")[0]!);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={`absolute inset-x-1 overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md ${STATUS_BLOCK_CLASSES[a.status]}`}
                      style={{ top: ((start - minHour * 60) / 60) * HOUR_HEIGHT + 2, height: (SLOT_DURATION_MINUTES / 60) * HOUR_HEIGHT - 4 }}
                    >
                      <span className="block truncate font-semibold">{a.patient?.name ?? "Hasta"}</span>
                      <span className="block truncate opacity-80">
                        {a.timeSlot.split(" - ")[0]} · {a.serviceName}
                      </span>
                    </button>
                  );
                })}

                {key === today && now !== null && now >= minHour * 60 && now <= maxHour * 60 && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500" style={{ top: ((now - minHour * 60) / 60) * HOUR_HEIGHT }}>
                    <span className="absolute -top-1.5 -left-1 size-3 rounded-full bg-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobil: gün gün liste */}
      <div className="space-y-4 lg:hidden">
        {days.map((key) => {
          const items = byDay(key);
          const closed = closedDays[key] !== undefined;
          const label = WEEKDAYS.find((w) => w.value === dayOfWeek(key))!.label;
          return (
            <section key={key} className={`rounded-2xl bg-white shadow-sm ring-1 ${key === today ? "ring-teal-300" : "ring-slate-200"}`}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="font-semibold text-slate-900">
                  {label} <span className="font-normal text-slate-500">{formatDateShort(key)}</span>
                </h3>
                {closed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                    <CalendarOff className="size-3.5" aria-hidden="true" /> Kapalı
                  </span>
                ) : (
                  key >= today && (
                    <Link href={`/admin/randevular/yeni?tarih=${key}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                      <Plus className="size-3.5" aria-hidden="true" /> Randevu
                    </Link>
                  )
                )}
              </div>
              {items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">Randevu yok</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => setSelectedId(a.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <span className="w-12 shrink-0 text-sm font-bold text-teal-800 tabular-nums">{a.timeSlot.split(" - ")[0]}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900">{a.patient?.name ?? "Hasta"}</span>
                          <span className="block truncate text-xs text-slate-500">{a.serviceName}</span>
                        </span>
                        <StatusBadge status={a.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <AppointmentDetailDialog appointment={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}

export function CalendarLegend() {
  const items: [string, string][] = [
    ["Beklemede", "border-amber-400 bg-amber-50"],
    ["Onaylandı", "border-teal-600 bg-teal-50"],
    ["Tamamlandı", "border-slate-400 bg-slate-100"],
    ["Gelmedi", "border-orange-400 bg-orange-50"],
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(([label, cls]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block size-3 rounded-sm border-l-4 ${cls}`} aria-hidden="true" /> {label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-sm border border-dashed border-teal-300" aria-hidden="true" /> Boş saat
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-sm bg-slate-200" aria-hidden="true" /> Kapalı
      </li>
    </ul>
  );
}

