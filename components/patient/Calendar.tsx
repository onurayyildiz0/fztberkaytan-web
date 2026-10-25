"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { dateToKey, keyToDate, type DateKey } from "@/lib/dates";

type CalendarProps = {
  value: DateKey | null;
  onChange: (key: DateKey) => void;
  minDate: DateKey;
  maxDate: DateKey;
  /** Görünen ayda randevuya müsait günler (fizyoterapistin Google Takvim müsaitliğinden) */
  availableDates: DateKey[];
  /** Görünen ay değiştiğinde "YYYY-MM" ile çağrılır (müsait günler yeniden yüklenir) */
  onMonthChange: (month: string) => void;
  loading?: boolean;
};

const WEEK_HEADERS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const monthFormatter = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long", weekday: "long" });

function monthStart(key: DateKey): DateKey {
  return `${key.slice(0, 7)}-01`;
}

function shiftMonth(start: DateKey, delta: number): DateKey {
  const d = keyToDate(start);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return dateToKey(d);
}

export default function Calendar({ value, onChange, minDate, maxDate, availableDates, onMonthChange, loading }: CalendarProps) {
  const [visible, setVisible] = useState<DateKey>(monthStart(value ?? minDate));

  useEffect(() => {
    onMonthChange(visible.slice(0, 7));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const first = keyToDate(visible);
  const leading = (first.getUTCDay() + 6) % 7; // Pazartesi ile başlayan hafta
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();

  const cells: (DateKey | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${visible.slice(0, 8)}${String(i + 1).padStart(2, "0")}`),
  ];

  const canPrev = visible > monthStart(minDate);
  const canNext = shiftMonth(visible, 1) <= maxDate;
  const isEnabled = (key: DateKey) => !loading && key >= minDate && key <= maxDate && availableDates.includes(key);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisible((v) => shiftMonth(v, -1))}
          disabled={!canPrev}
          className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          aria-label="Önceki ay"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="flex items-center gap-2 font-semibold text-slate-900 capitalize" aria-live="polite">
          {monthFormatter.format(first)}
          {loading && <LoaderCircle className="size-4 animate-spin text-slate-400" aria-label="Yükleniyor" />}
        </p>
        <button
          type="button"
          onClick={() => setVisible((v) => shiftMonth(v, 1))}
          disabled={!canNext}
          className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          aria-label="Sonraki ay"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        {WEEK_HEADERS.map((d) => (
          <div key={d} className="py-1 text-xs font-semibold text-slate-500" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((key, i) =>
          key === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={key}
              type="button"
              disabled={!isEnabled(key)}
              onClick={() => onChange(key)}
              aria-pressed={value === key}
              aria-label={dayFormatter.format(keyToDate(key))}
              className={`aspect-square rounded-lg text-sm font-medium tabular-nums transition ${
                value === key
                  ? "bg-teal-700 text-white shadow"
                  : isEnabled(key)
                    ? "bg-teal-50 text-teal-900 hover:bg-teal-100"
                    : "cursor-not-allowed text-slate-300"
              }`}
            >
              {Number(key.slice(8))}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
