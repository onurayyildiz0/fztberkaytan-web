import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  ClipboardX,
  FileWarning,
  Hourglass,
  Package,
  Receipt,
  Repeat,
  UserPlus,
  UserRound,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import AppointmentList from "@/components/admin/AppointmentList";
import { AdminPageHeader, KpiCard } from "@/components/admin/ui";
import type { AppointmentStatus } from "@/lib/appointments";
import { requireAdminPage } from "@/lib/auth/guards";
import { findAdminAppointments } from "@/lib/data/appointments";
import { addDays, formatDateLong, keyToDate, monthRange, todayKey } from "@/lib/dates";
import { LEGAL_PENDING_ITEMS } from "@/lib/legal";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";

export const dynamic = "force-dynamic";

// Red ve iptaller sayılmaz
const COUNTED = { $nin: ["rejected", "cancelled"] satisfies AppointmentStatus[] };

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

type QuickAction = { label: string; icon: LucideIcon; href?: string; primary?: boolean };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Yeni Randevu", icon: CalendarPlus, href: "/admin/randevular/yeni", primary: true },
  { label: "Yeni Hasta", icon: UserPlus, href: "/admin/hastalar/yeni" },
  { label: "Takvim", icon: CalendarRange, href: "/admin/takvim" },
  { label: "Randevular", icon: CalendarDays, href: "/admin/randevular" },
  { label: "Müsaitlik", icon: CalendarClock, href: "/admin/musaitlik" },
  { label: "Randevusuz / Hızlı Seans", icon: Zap },
  { label: "Gelir – Gider", icon: Receipt },
  { label: "Sabit Giderler", icon: Repeat },
  { label: "Muhasebe Arşivi", icon: BookOpenCheck },
];

function parseMonth(value: string | undefined, fallback: string): string {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : fallback;
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  await connectDB();

  const today = todayKey();
  const sp = await searchParams;
  const month = parseMonth(Array.isArray(sp.ay) ? sp.ay[0] : sp.ay, today.slice(0, 7));
  const [year, monthIndex] = month.split("-").map(Number);
  const range = monthRange(`${month}-01`);
  const monthDate = { $gte: keyToDate(range.start), $lt: keyToDate(range.end) };

  const [overdue, todays, pending, pendingCount, monthTotal, monthCompleted, monthPatients, monthLost, monthNewPatients] =
    await Promise.all([
      findAdminAppointments({ status: "approved", to: addDays(today, 1) }),
      findAdminAppointments({ from: today, to: addDays(today, 1) }),
      findAdminAppointments({ status: "pending", from: today, limit: 6 }),
      Appointment.countDocuments({ status: "pending", date: { $gte: keyToDate(today) } }),
      Appointment.countDocuments({ date: monthDate, status: COUNTED }),
      Appointment.countDocuments({ date: monthDate, status: "completed" }),
      Appointment.distinct("patientId", { date: monthDate, status: COUNTED }),
      Appointment.countDocuments({ date: monthDate, status: { $in: ["rejected", "cancelled"] } }),
      Patient.countDocuments({ createdAt: { $gte: keyToDate(range.start), $lt: keyToDate(range.end) } }),
    ]);

  // Saati geçtiği hâlde "Tamamlandı / Gelmedi" işaretlenmemiş onaylı randevular
  const nowDate = new Date();
  const unresolved = overdue.filter((a) => new Date(a.startsAt) < nowDate);
  const todaysActive = todays.filter((a) => a.status !== "rejected" && a.status !== "cancelled");
  const todaysPatients = new Set(todaysActive.map((a) => a.patient?.id ?? a.id)).size;
  const currentYear = Number(today.slice(0, 4));
  const years = Array.from({ length: currentYear - 2025 + 2 }, (_, i) => 2025 + i);

  return (
    <>
      <AdminPageHeader
        eyebrow="Klinik Yönetimi"
        title="Genel Bakış"
        description="Bugünkü hasta akışı, bekleyen talepler ve klinikteki önemli işler tek ekranda."
        actions={
          <>
            <span className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              {formatDateLong(today)}
            </span>
            <Link
              href={`/admin/takvim?tarih=${today}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm ring-1 ring-teal-200 transition hover:bg-teal-50"
            >
              <CalendarCheck className="size-4" aria-hidden="true" /> Bugünkü Takvim
            </Link>
          </>
        }
      />

      {LEGAL_PENDING_ITEMS.length > 0 && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" /> Yasal metinlerde {LEGAL_PENDING_ITEMS.length} yayın öncesi madde açık
          </p>
          <ul className="mt-1 list-disc pl-6 text-amber-800">
            {LEGAL_PENDING_ITEMS.map((p) => (
              <li key={p.item}>
                {p.page}: {p.item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {unresolved.length > 0 && (
        <Link
          href="/admin/randevular?zaman=gecmis&durum=approved"
          className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            <strong>{unresolved.length} geçmiş randevunun</strong> sonucu girilmedi. &quot;Tamamlandı&quot; veya &quot;Gelmedi&quot; olarak
            işaretleyin.
          </span>
          <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
        </Link>
      )}

      {/* KPI kartları */}
      <section aria-label="Özet göstergeler" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          label="Bugünkü Hasta"
          value={todaysPatients}
          hint={`${todaysActive.length} seans`}
          icon={UserRound}
          href={`/admin/randevular?tarih=${today}`}
        />
        <KpiCard
          label="Bekleyen Talep"
          value={pendingCount}
          hint={pendingCount ? "Onayınızı bekliyor" : "Bekleyen talep yok"}
          icon={Hourglass}
          tone="amber"
          href="/admin/randevular?durum=pending"
        />
        <KpiCard label="Borçlu Hasta" icon={Wallet} tone="red" pending />
        <KpiCard label="Aktif Paket" icon={Package} pending />
        <KpiCard label="Eksik Evrak" icon={FileWarning} tone="amber" pending />
        <KpiCard label="Yaklaşan Ödeme" icon={Receipt} tone="violet" pending />
      </section>

      {/* Hızlı işlemler */}
      <nav aria-label="Hızlı işlemler" className="mt-6 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon, href, primary }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                primary
                  ? "bg-teal-700 text-white hover:bg-teal-800"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-teal-800 hover:ring-teal-300"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
            </Link>
          ) : (
            <span
              key={label}
              aria-disabled="true"
              title="Bu özellik ilgili modülle birlikte eklenecek"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-400 ring-1 ring-slate-200"
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium">Yakında</span>
            </span>
          ),
        )}
      </nav>

      {/* Bugünkü randevular + bekleyen talepler */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bugünkü Randevular</h2>
              <p className="text-xs text-slate-500">
                {formatDateLong(today)} · {todaysActive.length} kayıt
              </p>
            </div>
            <Link
              href={`/admin/randevular?tarih=${today}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
            >
              Tümünü Gör <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <AppointmentList
            appointments={todaysActive}
            showActions
            emptyTitle="Bugün için randevu yok"
            emptyDescription="Randevusuz gelen hastalar için Hızlı Seans özelliği Randevular modülüyle eklenecek."
          />
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bekleyen Talepler</h2>
              <p className="text-xs text-slate-500">Online randevu talepleri · {pendingCount} kayıt</p>
            </div>
            <Link
              href="/admin/randevular?durum=pending"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
            >
              Tümünü Gör <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <AppointmentList
            appointments={pending}
            showActions
            emptyTitle="Bekleyen talep yok"
            emptyDescription="Hastaların online randevu talepleri burada onayınıza düşer."
          />
        </section>
      </div>

      {/* Aylık özet */}
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {MONTHS[monthIndex - 1]} {year} Özeti
            </h2>
            <p className="text-xs text-slate-500">Seçili ayın randevu ve hasta hareketleri</p>
          </div>
          <form action="/admin" className="flex items-center gap-2">
            <label htmlFor="ay-sec" className="sr-only">
              Ay
            </label>
            <select
              id="ay-sec"
              name="ay"
              defaultValue={month}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            >
              {years.flatMap((y) =>
                MONTHS.map((m, i) => {
                  const value = `${y}-${String(i + 1).padStart(2, "0")}`;
                  return (
                    <option key={value} value={value}>
                      {m} {y}
                    </option>
                  );
                }),
              )}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Göster
            </button>
          </form>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Toplam Randevu", value: monthTotal, hint: "Red / iptal hariç", icon: CalendarDays, tone: "text-slate-900" },
            { label: "Tamamlanan Seans", value: monthCompleted, hint: "Gerçekleşen seans", icon: CalendarCheck, tone: "text-teal-700" },
            { label: "Hasta", value: monthPatients.length, hint: "Farklı hasta sayısı", icon: Users, tone: "text-slate-900" },
            { label: "Yeni Hasta", value: monthNewPatients, hint: "Bu ay eklenen kart", icon: UserPlus, tone: "text-violet-700" },
            { label: "İptal / Red", value: monthLost, hint: "Gerçekleşmeyen", icon: ClipboardX, tone: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 ring-1 ring-slate-200">
              <dt className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                <s.icon className="size-4" aria-hidden="true" /> {s.label}
              </dt>
              <dd className={`mt-2 text-2xl font-bold tabular-nums ${s.tone}`}>{s.value}</dd>
              <dd className="text-xs text-slate-500">{s.hint}</dd>
            </div>
          ))}
        </dl>

        {/* Kasa özeti: Finans modülüyle aktifleşecek */}
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">Kasa Özeti</p>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
              Finans modülüyle aktif olacak
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Toplam Tahsilat", "Toplam Gider", "Net Kasa", "Bekleyen Ödeme"].map((label) => (
              <div key={label} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-300">— TL</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
