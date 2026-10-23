import type { Metadata } from "next";
import Link from "next/link";
import { Search, X } from "lucide-react";
import AppointmentList from "@/components/admin/AppointmentList";
import { Card } from "@/components/panel/ui";
import { AdminPageHeader } from "@/components/admin/ui";
import { isAppointmentStatus, type AppointmentStatus } from "@/lib/appointments";
import { requireAdminPage } from "@/lib/auth/guards";
import { findAdminAppointments } from "@/lib/data/appointments";
import { addDays, formatDateLong, isDateKey, todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Randevu Yönetimi" };
export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value: AppointmentStatus | null; label: string }[] = [
  { value: null, label: "Tümü" },
  { value: "pending", label: "Bekleyen" },
  { value: "approved", label: "Onaylanan" },
  { value: "completed", label: "Tamamlanan" },
  { value: "no_show", label: "Gelmedi" },
  { value: "cancelled", label: "İptal Edilen" },
  { value: "rejected", label: "Reddedilen" },
];

const RANGE_FILTERS = [
  { value: "yaklasan", label: "Yaklaşan" },
  { value: "gecmis", label: "Geçmiş" },
  { value: "tumu", label: "Tüm zamanlar" },
] as const;
type Range = (typeof RANGE_FILTERS)[number]["value"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;

  const statusParam = first(sp.durum);
  const status = isAppointmentStatus(statusParam) ? statusParam : null;
  const dateParam = first(sp.tarih);
  const date = isDateKey(dateParam) ? dateParam : null;
  const rangeParam = first(sp.zaman);
  const range: Range = RANGE_FILTERS.some((r) => r.value === rangeParam) ? (rangeParam as Range) : "yaklasan";

  const today = todayKey();
  const appointments = await findAdminAppointments({
    status: status ?? undefined,
    ...(date
      ? { from: date, to: addDays(date, 1) }
      : range === "yaklasan"
        ? { from: today }
        : range === "gecmis"
          ? { to: today, sort: -1 as const }
          : { sort: -1 as const }),
    limit: 300,
  });

  const href = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const merged = { durum: status, tarih: date, zaman: date ? null : range, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/admin/randevular${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <AdminPageHeader eyebrow="Randevular" title="Randevu Yönetimi" description="Tüm randevuları filtreleyin, detaylarını görüntüleyin ve durumlarını güncelleyin." />

      <Card className="mb-6 space-y-4 p-4">
        <nav aria-label="Durum filtresi" className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = f.value === status;
            return (
              <Link
                key={f.label}
                href={href({ durum: f.value })}
                aria-current={active ? "true" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Zaman filtresi" className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {RANGE_FILTERS.map((r) => {
              const active = !date && r.value === range;
              return (
                <Link
                  key={r.value}
                  href={href({ zaman: r.value, tarih: null })}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r.label}
                </Link>
              );
            })}
          </nav>

          <form action="/admin/randevular" className="flex items-center gap-2">
            {status && <input type="hidden" name="durum" value={status} />}
            <label htmlFor="tarih" className="text-sm font-medium text-slate-600">
              Tarih
            </label>
            <input
              id="tarih"
              name="tarih"
              type="date"
              defaultValue={date ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Search className="size-4" aria-hidden="true" /> Filtrele
            </button>
            {date && (
              <Link
                href={href({ tarih: null, zaman: "yaklasan" })}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                <X className="size-4" aria-hidden="true" /> Temizle
              </Link>
            )}
          </form>
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">
          {date ? `${formatDateLong(date)} · ` : ""}
          <span className="font-semibold text-slate-900">{appointments.length}</span> randevu
        </div>
        <AppointmentList
          appointments={appointments}
          showActions
          emptyTitle="Bu filtrelere uygun randevu yok"
          emptyDescription="Farklı bir durum veya tarih seçmeyi deneyin."
        />
      </Card>
    </>
  );
}
