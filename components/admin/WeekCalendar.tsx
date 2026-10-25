"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AppointmentDetailDialog from "@/components/admin/AppointmentDetailDialog";
import { StatusBadge } from "@/components/panel/ui";
import { STATUS_BLOCK_CLASSES, type AdminAppointmentDTO } from "@/lib/appointments";
import { WEEKDAYS, addDays, dayOfWeek, formatDateShort, nowMinutes, timeToMinutes, todayKey, type DateKey } from "@/lib/dates";
import { serviceLabel } from "@/lib/services";

type DayBlock = { start: string; end: string; title?: string };

type Props = {
  weekStart: DateKey;
  appointments: AdminAppointmentDTO[];
  /** Klinik açık saatleri (gün gün; Pazar boş) */
  openHours: Record<DateKey, DayBlock[]>;
  /** Google Takvim'deki meşgul etkinlikler (randevu etkinlikleri hariç) */
  busy: Record<DateKey, DayBlock[]>;
};

const HOUR_HEIGHT = 64; // px
const toMinutes = (t: string) => (t === "24:00" ? 24 * 60 : timeToMinutes(t));
const rangeOf = (timeSlot: string) => {
  const [s, e] = timeSlot.split(" - ");
  const start = timeToMinutes(s!);
  let end = e ? timeToMinutes(e) : start + 60;
  if (end <= start) end += 24 * 60;
  return { start, end };
};

export default function WeekCalendar({ weekStart, appointments, openHours, busy }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = todayKey();

  const proposals = appointments
    .filter((a) => a.proposal && (a.status === "pending" || a.status === "approved"))
    .map((a) => ({ appointment: a, date: a.proposal!.date, timeSlot: a.proposal!.timeSlot }));

  // Saat aralığı: açık saatler, randevular ve öneriler kapsanır (varsayılan 08:00 – 20:00)
  const ranges = [
    ...Object.values(openHours).flat().map((b) => ({ start: toMinutes(b.start), end: toMinutes(b.end) })),
    ...appointments.map((a) => rangeOf(a.timeSlot)),
    ...proposals.map((p) => rangeOf(p.timeSlot)),
  ];
  const minHour = Math.min(8, ...ranges.map((r) => Math.floor(r.start / 60)));
  const maxHour = Math.min(24, Math.max(20, ...ranges.map((r) => Math.ceil(r.end / 60))));
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);
  const top = (minutes: number) => ((minutes - minHour * 60) / 60) * HOUR_HEIGHT;

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(nowMinutes());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const byDay = (key: DateKey) => appointments.filter((a) => a.date === key).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

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
              </div>
            );
          })}

          <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
            {hours.map((h, i) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-slate-400 tabular-nums" style={{ top: i * HOUR_HEIGHT }}>
                {i === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>

          {days.map((key) => {
            const blocks = openHours[key] ?? [];
            const isPastDay = key < today;
            return (
              <div key={key} className="relative border-l border-slate-200 bg-slate-50/60" style={{ height: hours.length * HOUR_HEIGHT }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
                ))}

                {/* Açık saatler: her saat dilimi tıklanınca o saate yeni randevu */}
                {blocks.flatMap((b) => {
                  const cells = [];
                  for (let m = toMinutes(b.start); m < toMinutes(b.end); m += 60) {
                    const time = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
                    const style = { top: top(m), height: HOUR_HEIGHT };
                    cells.push(
                      isPastDay ? (
                        <div key={time} className="absolute inset-x-0 bg-emerald-50/50" style={style} />
                      ) : (
                        <Link
                          key={time}
                          href={`/admin/randevular/yeni?tarih=${key}&saat=${time}`}
                          title={`${time} · yeni randevu`}
                          className="group absolute inset-x-0 border-t border-emerald-100 bg-emerald-50/70 transition hover:bg-emerald-100"
                          style={style}
                        >
                          <Plus className="absolute top-1 right-1.5 size-3.5 text-emerald-700 opacity-0 group-hover:opacity-100" aria-hidden="true" />
                        </Link>
                      ),
                    );
                  }
                  return cells;
                })}

                {/* Google Takvim'deki meşgul etkinlikler (o saatler hastalara kapalı) */}
                {(busy[key] ?? []).map((b, i) => {
                  const start = toMinutes(b.start);
                  const end = toMinutes(b.end);
                  return (
                    <div
                      key={`b-${i}`}
                      title={`${b.title ?? "Meşgul"} · ${b.start}–${b.end} (Google Takvim)`}
                      className="pointer-events-none absolute inset-x-0 z-[1] bg-[repeating-linear-gradient(135deg,var(--color-slate-200)_0_6px,var(--color-slate-100)_6px_12px)] opacity-90"
                      style={{ top: top(start), height: Math.max(((end - start) / 60) * HOUR_HEIGHT, 6) }}
                    >
                      <span className="absolute inset-x-1.5 top-1 truncate text-[10px] font-semibold text-slate-700">
                        {b.start} {b.title ?? "Meşgul"}
                      </span>
                    </div>
                  );
                })}

                {/* Bekleyen erteleme önerileri */}
                {proposals
                  .filter((p) => p.date === key)
                  .map((p) => {
                    const r = rangeOf(p.timeSlot);
                    return (
                      <button
                        key={`p-${p.appointment.id}`}
                        type="button"
                        onClick={() => setSelectedId(p.appointment.id)}
                        className="absolute inset-x-1 z-[1] overflow-hidden rounded-md border-2 border-dashed border-amber-400 bg-amber-50/90 px-2 py-1 text-left text-xs text-amber-900"
                        style={{ top: top(r.start) + 2, height: Math.max(((r.end - r.start) / 60) * HOUR_HEIGHT - 4, 22) }}
                      >
                        <span className="block truncate font-semibold">Öneri: {p.appointment.patient?.name ?? "Hasta"}</span>
                        <span className="block truncate opacity-80">Hasta onayı bekleniyor</span>
                      </button>
                    );
                  })}

                {/* Randevular */}
                {byDay(key).map((a) => {
                  const r = rangeOf(a.timeSlot);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={`absolute inset-x-1 z-[2] overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md ${STATUS_BLOCK_CLASSES[a.status]}`}
                      style={{ top: top(r.start) + 2, height: Math.max(((r.end - r.start) / 60) * HOUR_HEIGHT - 4, 22) }}
                    >
                      <span className="block truncate font-semibold">{a.patient?.name ?? "Hasta"}</span>
                      <span className="block truncate opacity-80">
                        {a.timeSlot.split(" - ")[0]} · {serviceLabel(a.serviceName, a.serviceOption)}
                      </span>
                    </button>
                  );
                })}

                {key === today && now !== null && now >= minHour * 60 && now <= maxHour * 60 && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500" style={{ top: top(now) }}>
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
          const blocks = openHours[key] ?? [];
          const busyBlocks = busy[key] ?? [];
          const label = WEEKDAYS.find((w) => w.value === dayOfWeek(key))!.label;
          return (
            <section key={key} className={`rounded-2xl bg-white shadow-sm ring-1 ${key === today ? "ring-teal-300" : "ring-slate-200"}`}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="font-semibold text-slate-900">
                  {label} <span className="font-normal text-slate-500">{formatDateShort(key)}</span>
                </h3>
                {key >= today && (
                  <Link href={`/admin/randevular/yeni?tarih=${key}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                    <Plus className="size-3.5" aria-hidden="true" /> Randevu
                  </Link>
                )}
              </div>
              <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-600">
                {blocks.length ? (
                  <span className="text-emerald-700">Açık: {blocks.map((b) => `${b.start}–${b.end}`).join(", ")}</span>
                ) : (
                  "Kapalı"
                )}
                {busyBlocks.length > 0 && <> · Takvimde: {busyBlocks.map((b) => `${b.start} ${b.title ?? "Meşgul"}`).join(", ")}</>}
              </p>
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
                          <span className="block truncate text-xs text-slate-500">
                            {serviceLabel(a.serviceName, a.serviceOption)}
                            {a.proposal && " · erteleme önerildi"}
                          </span>
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
    ["Beklemede", "border-l-4 border-amber-400 bg-amber-50"],
    ["Onaylandı", "border-l-4 border-teal-600 bg-teal-50"],
    ["Tamamlandı", "border-l-4 border-slate-400 bg-slate-100"],
    ["Gelmedi", "border-l-4 border-orange-400 bg-orange-50"],
    ["Erteleme önerisi", "border-2 border-dashed border-amber-400 bg-amber-50"],
    ["Açık saat", "border border-emerald-200 bg-emerald-50"],
    ["Google Takvim etkinliği", "bg-slate-200"],
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(([label, cls]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block size-3 rounded-sm ${cls}`} aria-hidden="true" /> {label}
        </li>
      ))}
    </ul>
  );
}

