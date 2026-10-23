"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CircleCheckBig,
  Clock,
  LoaderCircle,
} from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import Calendar from "@/components/patient/Calendar";
import { Card } from "@/components/panel/ui";
import { formatDateLong, type DateKey } from "@/lib/dates";
import { SERVICES, formatPrice, type ServiceName } from "@/lib/services";

type Slot = { start: string; label: string };

type BookingWizardProps = {
  initialService: ServiceName | null;
  minDate: DateKey;
  maxDate: DateKey;
  openDays: number[];
  closedDates: DateKey[];
};

const STEPS = ["Hizmet", "Tarih & Saat", "Not", "Onay"] as const;
const NOTE_MAX = 1000;

export default function BookingWizard({ initialService, minDate, maxDate, openDays, closedDates }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [service, setService] = useState<ServiceName | null>(initialService);
  const [date, setDate] = useState<DateKey | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsVersion, setSlotsVersion] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Seçilen gün için müsait slotları getir
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlots([]);
    fetch(`/api/appointments/availability?date=${date}`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json()) as { slots?: Slot[]; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Müsait saatler alınamadı.");
        setSlots(data.slots ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Müsait saatler alınamadı.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });
    return () => controller.abort();
  }, [date, slotsVersion]);

  const selectedSlot = slots.find((s) => s.start === time) ?? null;
  const canContinue = [service !== null, date !== null && selectedSlot !== null, notes.length <= NOTE_MAX, true][step];

  async function submit() {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: service, date, time, notes }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
      if (!res.ok) {
        setError(data.message ?? "Randevu oluşturulamadı.");
        if (data.code === "SLOT_TAKEN") {
          setTime(null);
          setSlotsVersion((v) => v + 1);
          setStep(1);
        }
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done && service && date && selectedSlot) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheckBig className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Randevu talebiniz alındı!</h2>
        <p className="mt-2 text-slate-600">
          {service} · {formatDateLong(date)} · {selectedSlot.label}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Fizyoterapist talebinizi onayladığında e-posta ile bilgilendirileceksiniz.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/hasta-paneli/randevularim"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <CalendarCheck className="size-4" aria-hidden="true" /> Randevularım
          </Link>
          <Link
            href="/hasta-paneli"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Panele Dön
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Adım göstergesi */}
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${i <= step ? "bg-teal-600" : "bg-slate-200"}`} />
            <span
              className={`text-xs font-medium sm:text-sm ${i === step ? "text-teal-800" : "text-slate-500"}`}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="hidden sm:inline">{i + 1}. </span>
              {label}
            </span>
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4">
          <FormAlert type="error" message={error} />
        </div>
      )}

      <Card className="p-5 sm:p-6">
        {step === 0 && (
          <fieldset>
            <legend className="text-lg font-semibold text-slate-900">Hangi hizmet için randevu almak istiyorsunuz?</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => {
                const active = service === s.name;
                return (
                  <label
                    key={s.slug}
                    className={`relative flex cursor-pointer flex-col rounded-xl p-4 ring-1 transition ${
                      active ? "bg-teal-50 ring-2 ring-teal-600" : "bg-white ring-slate-200 hover:ring-teal-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={s.name}
                      checked={active}
                      onChange={() => {
                        setService(s.name);
                        setError(null);
                      }}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                      {s.name}
                      {active && <Check className="size-5 text-teal-700" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 text-sm text-slate-500">
                      {s.durationMinutes} dk · {formatPrice(s.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tarih ve saat seçin</h2>
            {openDays.length === 0 ? (
              <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Şu anda online randevuya açık gün bulunmuyor. Lütfen telefonla iletişime geçin.
              </p>
            ) : (
              <div className="mt-5 grid gap-8 md:grid-cols-2">
                <Calendar
                  value={date}
                  onChange={(key) => {
                    setDate(key);
                    setTime(null);
                    setError(null);
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  openDays={openDays}
                  closedDates={closedDates}
                />
                <div>
                  {!date ? (
                    <p className="text-sm text-slate-500">Müsait saatleri görmek için takvimden bir gün seçin.</p>
                  ) : (
                    <>
                      <p className="mb-3 text-sm font-medium text-slate-700">{formatDateLong(date)}</p>
                      {slotsLoading ? (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Müsait saatler yükleniyor...
                        </p>
                      ) : slots.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                          Bu gün için boş saat kalmadı. Lütfen başka bir gün seçin.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Müsait saatler">
                          {slots.map((slot) => {
                            const active = time === slot.start;
                            return (
                              <button
                                key={slot.start}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setTime(slot.start)}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium tabular-nums ring-1 transition ${
                                  active
                                    ? "bg-teal-700 text-white ring-teal-700"
                                    : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                                }`}
                              >
                                <Clock className="size-4" aria-hidden="true" />
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <label htmlFor="notes" className="text-lg font-semibold text-slate-900">
              Eklemek istediğiniz bir not var mı?
            </label>
            <p className="mt-1 text-sm text-slate-500">
              Randevunuzla ilgili kısa bir not ekleyebilirsiniz (isteğe bağlı). Ayrıntılı sağlık bilgilerinizi
              değerlendirme sırasında yüz yüze paylaşabilirsiniz; gerekli olmayan sağlık bilgilerini buraya yazmamanızı
              öneririz.
            </p>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              maxLength={NOTE_MAX}
              placeholder="Örn: Bu benim ilk randevum / Öğleden sonraları ulaşılabilirim..."
              className="mt-4 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {notes.length}/{NOTE_MAX}
            </p>
          </div>
        )}

        {step === 3 && service && date && selectedSlot && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Randevu bilgilerinizi kontrol edin</h2>
            <dl className="mt-5 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
              {[
                ["Hizmet", service],
                ["Tarih", formatDateLong(date)],
                ["Saat", selectedSlot.label],
                ["Not", notes.trim() || "-"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="col-span-2 font-medium break-words whitespace-pre-wrap text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-slate-500">
              Talebiniz fizyoterapist onayına gönderilecektir. Onay durumunu e-posta ve panelinizden takip edebilirsiniz.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:invisible"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Geri
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => s + 1);
              }}
              disabled={!canContinue}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Devam <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CalendarCheck className="size-4" aria-hidden="true" />
              )}
              {submitting ? "Gönderiliyor..." : "Randevu Talebini Gönder"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
