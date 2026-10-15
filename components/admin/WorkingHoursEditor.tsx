"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, LoaderCircle, Plus, Save } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import { Card } from "@/components/panel/ui";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { WEEKDAYS, isTime, minutesToTime, slotLabel, timeToMinutes } from "@/lib/dates";

export type EditableDay = { dayOfWeek: number; isDayOff: boolean; slots: string[] };

// 07:00 – 21:00 arası saatlik hazır slotlar
const PRESET_SLOTS = Array.from({ length: 15 }, (_, i) => minutesToTime((7 + i) * 60));

export default function WorkingHoursEditor({ initialDays }: { initialDays: EditableDay[] }) {
  const router = useRouter();
  const [days, setDays] = useState<EditableDay[]>(initialDays);
  const [customTime, setCustomTime] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const dirty = useMemo(() => JSON.stringify(days) !== JSON.stringify(initialDays), [days, initialDays]);

  function patchDay(dayOfWeek: number, patch: (d: EditableDay) => EditableDay) {
    setAlert(null);
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? patch(d) : d)));
  }

  function toggleSlot(dayOfWeek: number, slot: string) {
    patchDay(dayOfWeek, (d) => ({
      ...d,
      slots: d.slots.includes(slot) ? d.slots.filter((s) => s !== slot) : [...d.slots, slot].sort(),
    }));
  }

  function addCustom(dayOfWeek: number) {
    const value = customTime[dayOfWeek];
    if (!isTime(value)) return;
    patchDay(dayOfWeek, (d) => ({ ...d, slots: [...new Set([...d.slots, value])].sort() }));
    setCustomTime((c) => ({ ...c, [dayOfWeek]: "" }));
  }

  function copyToWeekdays(source: EditableDay) {
    setAlert(null);
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek >= 1 && d.dayOfWeek <= 5 ? { ...d, isDayOff: source.isDayOff, slots: [...source.slots] } : d,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setAlert({ type: "error", message: data.message ?? "Kaydedilemedi." });
        return;
      }
      setAlert({ type: "success", message: "Çalışma saatleri kaydedildi. Hastalar artık bu saatlerden randevu alabilir." });
      router.refresh();
    } catch {
      setAlert({ type: "error", message: "Sunucuya ulaşılamadı." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {alert && <FormAlert type={alert.type} message={alert.message} />}

      {WEEKDAYS.map(({ value, label }) => {
        const day = days.find((d) => d.dayOfWeek === value)!;
        const extraSlots = day.slots.filter((s) => !PRESET_SLOTS.includes(s));
        return (
          <Card key={value} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="w-24 font-semibold text-slate-900">{label}</h2>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={!day.isDayOff}
                    onChange={(e) => patchDay(value, (d) => ({ ...d, isDayOff: !e.target.checked }))}
                  />
                  <span
                    aria-hidden="true"
                    className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-teal-600 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                  />
                  <span className={day.isDayOff ? "text-slate-500" : "font-medium text-teal-800"}>
                    {day.isDayOff ? "Kapalı" : `Açık · ${day.slots.length} slot`}
                  </span>
                </label>
              </div>
              {value === 1 && (
                <button
                  type="button"
                  onClick={() => copyToWeekdays(day)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  Hafta içine kopyala
                </button>
              )}
            </div>

            {!day.isDayOff && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} saatleri`}>
                  {[...PRESET_SLOTS, ...extraSlots].sort().map((slot) => {
                    const active = day.slots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={active}
                        title={slotLabel(slot, SLOT_DURATION_MINUTES)}
                        onClick={() => toggleSlot(value, slot)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums ring-1 transition ${
                          active
                            ? "bg-teal-700 text-white ring-teal-700"
                            : "bg-white text-slate-600 ring-slate-200 hover:ring-teal-400"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label htmlFor={`custom-${value}`} className="sr-only">
                    Özel saat ekle
                  </label>
                  <input
                    id={`custom-${value}`}
                    type="time"
                    step={300}
                    value={customTime[value] ?? ""}
                    onChange={(e) => setCustomTime((c) => ({ ...c, [value]: e.target.value }))}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addCustom(value)}
                    disabled={!isTime(customTime[value])}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" /> Özel saat ekle
                  </button>
                </div>
                {day.slots.some((a, i) =>
                  day.slots.slice(i + 1).some((b) => Math.abs(timeToMinutes(a) - timeToMinutes(b)) < SLOT_DURATION_MINUTES),
                ) && (
                  <p className="mt-2 text-xs text-amber-700">
                    Uyarı: Bazı slotlar arasında {SLOT_DURATION_MINUTES} dakikadan az fark var; seanslar çakışabilir.
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-5" aria-hidden="true" />
          )}
          {dirty ? "Değişiklikleri Kaydet" : "Kaydedildi"}
        </button>
      </div>
    </div>
  );
}
