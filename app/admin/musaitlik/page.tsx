import type { Metadata } from "next";
import { CalendarCheck2, CalendarRange, ExternalLink } from "lucide-react";
import GoogleCalendarStatus from "@/components/admin/GoogleCalendarStatus";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card } from "@/components/panel/ui";
import { OPEN_HOURS_LABEL, slotStepMinutes } from "@/lib/appointments";
import { requireAdminPage } from "@/lib/auth/guards";
import { findAdminAppointments, getGoogleBusyByDay, openHoursByDay } from "@/lib/data/appointments";
import { addDays, formatDateLong, todayKey } from "@/lib/dates";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Müsaitlik" };
export const dynamic = "force-dynamic";

const TIPS = [
  "Bir saati kapatmak için Google Takvim'inize o saate bir etkinlik ekleyin (toplantı, özel iş vb.). Etkinlik “Meşgul” görünüyorsa o saat hastalara “Dolu” gösterilir.",
  "Bütün bir günü kapatmak için (izin, tatil) o güne “Tüm gün” bir etkinlik ekleyin.",
  "“Müsait” olarak işaretlediğiniz etkinlikler saati kapatmaz.",
  "Değişiklikler birkaç dakika içinde hasta randevu ekranına yansır.",
];

export default async function AvailabilityPage() {
  await requireAdminPage();
  const today = todayKey();
  const until = addDays(today, 13);
  const googleConnected = isGoogleCalendarConfigured();
  const [busy, appointments] = await Promise.all([
    getGoogleBusyByDay(today, until),
    findAdminAppointments({ from: today, to: addDays(until, 1), status: ["pending", "approved"] }),
  ]);
  const openHours = openHoursByDay(today, until);
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const countByDay = (key: string) => appointments.filter((a) => a.date === key).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Müsaitlik"
        description={`Hastalar ${OPEN_HOURS_LABEL} arasındaki boş saatlere randevu talebi gönderebilir.`}
        actions={<GoogleCalendarStatus />}
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="p-6 xl:col-span-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarRange className="size-5 text-teal-700" aria-hidden="true" /> Nasıl çalışır?
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              • Açık saatler: <strong>{OPEN_HOURS_LABEL}</strong>. Bu saatler içindeki her boşluk hastalara açıktır.
            </li>
            <li>• Alınmış bir randevunun saati diğer hastalara “Dolu” olarak görünür ve seçilemez.</li>
            <li>
              • Başlangıç saatleri hizmet süresine göre önerilir:{" "}
              {SERVICES.map((s) => `${s.name} ${s.durationMinutes} dk (${slotStepMinutes(s.durationMinutes) === 60 ? "saat başı" : "yarım saatte bir"})`).join(", ")}.
            </li>
            <li>• Onaylanan randevular Google Takvim&apos;inize otomatik eklenir; iptal edilince silinir.</li>
          </ul>

          <h3 className="mt-6 font-semibold text-slate-900">Bir saati veya günü kapatmak</h3>
          {googleConnected ? (
            <ol className="mt-3 space-y-3 text-sm text-slate-600">
              {TIPS.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">
                    {i + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Google Takvim bağlı değil; şu an yalnızca sistemdeki randevular saatleri kapatıyor. Bağlandığında takviminizdeki
              etkinlikler de o saatleri otomatik kapatır.
            </p>
          )}
          <a
            href="https://calendar.google.com/calendar/r/week"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
          >
            Google Takvim&apos;i aç <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarCheck2 className="size-5 text-teal-700" aria-hidden="true" /> Önümüzdeki 14 gün
          </h2>
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {days.map((key) => {
              const open = openHours[key] ?? [];
              const dayBusy = busy[key] ?? [];
              const count = countByDay(key);
              return (
                <li key={key} className="flex items-start justify-between gap-3 py-2">
                  <span className="text-slate-700">{formatDateLong(key)}</span>
                  <span className="text-right">
                    {open.length ? (
                      <span className="font-semibold text-emerald-700">{open.map((b) => `${b.start}–${b.end}`).join(", ")}</span>
                    ) : (
                      <span className="text-slate-400">Kapalı</span>
                    )}
                    {count > 0 && <span className="block text-xs text-slate-500">{count} randevu</span>}
                    {dayBusy.length > 0 && (
                      <span className="block text-xs text-slate-500">
                        {dayBusy.map((b) => `${b.start} ${b.title ?? "Meşgul"}`).join(", ")}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
