import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import GoogleCalendarStatus from "@/components/admin/GoogleCalendarStatus";
import WeekCalendar, { CalendarLegend } from "@/components/admin/WeekCalendar";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth/guards";
import { findAdminAppointments, getGoogleBusyByDay, openHoursByDay } from "@/lib/data/appointments";
import { addDays, formatDateShort, isDateKey, startOfWeek, todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Takvim" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CalendarPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const today = todayKey();
  const tarih = first(sp.tarih);
  const showCancelled = first(sp.iptaller) === "1";
  const weekStart = startOfWeek(isDateKey(tarih) ? tarih : today);
  const weekEnd = addDays(weekStart, 7);

  const [appointments, busy] = await Promise.all([
    findAdminAppointments({
      from: weekStart,
      to: weekEnd,
      status: showCancelled ? undefined : ["pending", "approved", "completed", "no_show"],
      // Başka haftadaki randevuların bu haftaya önerilen yeni saatleri de görünsün
      includeProposals: true,
    }),
    getGoogleBusyByDay(weekStart, addDays(weekStart, 6)),
  ]);
  const openHours = openHoursByDay(weekStart, addDays(weekStart, 6));
  const qs = (week: string, cancelled = showCancelled) => `/admin/takvim?tarih=${week}${cancelled ? "&iptaller=1" : ""}`;
  const pending = appointments.filter((a) => a.status === "pending").length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Takvim"
        description={`${formatDateShort(weekStart)} – ${formatDateShort(addDays(weekStart, 6))} · ${appointments.length} randevu${pending ? ` · ${pending} onay bekliyor` : ""}`}
        actions={
          <>
            <GoogleCalendarStatus />
            <Link
              href="/admin/randevular/yeni"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <CalendarPlus className="size-4" aria-hidden="true" /> Yeni Randevu
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Hafta seçimi" className="flex items-center gap-2">
          <Link href={qs(addDays(weekStart, -7))} className="inline-flex size-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Önceki hafta">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
          <Link href={qs(today)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            Bu Hafta
          </Link>
          <Link href={qs(addDays(weekStart, 7))} className="inline-flex size-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Sonraki hafta">
            <ChevronRight className="size-5" aria-hidden="true" />
          </Link>
          <form action="/admin/takvim" className="ml-1 flex items-center">
            <label htmlFor="takvim-tarih" className="sr-only">
              Tarihe git
            </label>
            <input id="takvim-tarih" type="date" name="tarih" defaultValue={tarih ?? ""} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
            <button type="submit" className="ml-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              Git
            </button>
          </form>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <CalendarLegend />
          <Link href={qs(weekStart, !showCancelled)} className="text-xs font-semibold text-teal-700 hover:underline">
            {showCancelled ? "İptal/Red gizle" : "İptal/Red göster"}
          </Link>
        </div>
      </div>

      <WeekCalendar weekStart={weekStart} appointments={appointments} openHours={openHours} busy={busy} />
    </>
  );
}
