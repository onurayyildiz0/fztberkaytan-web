import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2, CalendarRange, ExternalLink } from "lucide-react";
import GoogleCalendarStatus from "@/components/admin/GoogleCalendarStatus";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card } from "@/components/panel/ui";
import { requireAdminPage } from "@/lib/auth/guards";
import { getAvailabilityBlocksByDay } from "@/lib/data/appointments";
import { addDays, formatDateLong, todayKey } from "@/lib/dates";
import { isAvailabilityCalendarConfigured } from "@/lib/google-calendar";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Müsaitlik" };
export const dynamic = "force-dynamic";

const SETUP_STEPS = [
  "Google Takvim'de sol menüden “Diğer takvimler” → “+” → “Yeni takvim oluştur” ile “Randevu Müsaitliği” adında bir takvim açın.",
  "Bu takvimin ayarlarında “Belirli kişilerle paylaş” bölümüne servis hesabının e-postasını ekleyin ve “Etkinliklerde değişiklik yapma” yetkisi verin. Ana takviminiz de aynı şekilde paylaşılmış olmalıdır.",
  "Aynı ayarlar sayfasındaki “Takvim kimliği”ni kopyalayıp .env.local dosyasında GOOGLE_AVAILABILITY_CALENDAR_ID değerine yazın ve sunucuyu yeniden başlatın.",
  "Müsait olduğunuz zamanları bu takvime etkinlik olarak çizin (ör. Salı 09:00–13:00). Tekrarlayan etkinlik de kullanabilirsiniz (her hafta Pazartesi 10:00–18:00 gibi).",
];

export default async function AvailabilityPage() {
  await requireAdminPage();
  const today = todayKey();
  const until = addDays(today, 13);
  const configured = isAvailabilityCalendarConfigured();
  const blocks = configured ? await getAvailabilityBlocksByDay(today, until) : null;
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Müsaitlik"
        description="Randevuya açık saatlerinizi tamamen Google Takvim'den yönetirsiniz; burada sabit çalışma saati veya seans kısıtlaması yoktur."
        actions={<GoogleCalendarStatus />}
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="p-6 xl:col-span-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarRange className="size-5 text-teal-700" aria-hidden="true" /> Nasıl çalışır?
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              • Hastalar yalnızca <strong>“Randevu Müsaitliği”</strong> takviminize çizdiğiniz blokların içindeki saatlere randevu
              talebi gönderebilir.
            </li>
            <li>
              • Ana takviminizde “Meşgul” görünen her etkinlik (toplantı, özel iş vb.) o saati otomatik kapatır. “Müsait” olarak
              işaretlediğiniz etkinlikler saati kapatmaz.
            </li>
            <li>
              • Randevu başlangıçları 15 dakika aralıklarla önerilir; seans süresi hizmete göre hesaplanır (
              {SERVICES.map((s) => `${s.name} ${s.durationMinutes} dk`).join(", ")}).
            </li>
            <li>• Onaylanan randevular ana takviminize otomatik eklenir; iptal edilince silinir.</li>
          </ul>

          <h3 className="mt-6 font-semibold text-slate-900">Kurulum (bir kez)</h3>
          <ol className="mt-3 space-y-3 text-sm text-slate-600">
            {SETUP_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href="https://calendar.google.com/calendar/r/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
          >
            Google Takvim ayarlarını aç <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarCheck2 className="size-5 text-teal-700" aria-hidden="true" /> Önümüzdeki 14 gün
          </h2>
          {!configured ? (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Müsaitlik takvimi henüz bağlanmadı. Bağlanana kadar hastalar online randevu alamaz; siz yine de{" "}
              <Link href="/admin/randevular/yeni" className="font-semibold underline">
                “Müsaitlik dışında” seçeneğiyle
              </Link>{" "}
              randevu oluşturabilirsiniz.
            </p>
          ) : blocks === null ? (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">Müsaitlik takvimi okunamadı. Paylaşım ayarlarını kontrol edin.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {days.map((key) => {
                const list = blocks[key] ?? [];
                return (
                  <li key={key} className="flex items-start justify-between gap-3 py-2">
                    <span className="text-slate-700">{formatDateLong(key)}</span>
                    <span className={`text-right ${list.length ? "font-semibold text-emerald-700" : "text-slate-400"}`}>
                      {list.length ? list.map((b) => `${b.start}–${b.end}`).join(", ") : "Müsaitlik yok"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
