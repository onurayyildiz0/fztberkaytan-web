"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, CircleCheckBig, Clock, LoaderCircle } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import Calendar from "@/components/patient/Calendar";
import { Card } from "@/components/panel/ui";
import { formatDateLong, type DateKey } from "@/lib/dates";
import { SERVICES, getService, serviceDurationMinutes, serviceLabel, type ServiceName } from "@/lib/services";

type Slot = { start: string; label: string; available: boolean };

type BookingWizardProps = {
  initialService: ServiceName | null;
  minDate: DateKey;
  maxDate: DateKey;
};

const STEPS = ["Hizmet", "Tarih & Saat", "Şikâyet", "Onay"] as const;
const NOTE_MIN = 3;
const NOTE_MAX = 1000;

export default function BookingWizard({ initialService, minDate, maxDate }: BookingWizardProps) {
  const router = useRouter();
  const initialHasOptions = !!(initialService && getService(initialService)?.options?.length);
  const [step, setStep] = useState(initialService && !initialHasOptions ? 1 : 0);
  const [service, setService] = useState<ServiceName | null>(initialService);
  const [option, setOption] = useState<string | null>(null);
  const [date, setDate] = useState<DateKey | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [month, setMonth] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<DateKey[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const serviceDef = service ? getService(service) : undefined;
  const needsOption = !!serviceDef?.options?.length;
  const serviceReady = !!service && (!needsOption || !!option);
  const query = service ? `service=${encodeURIComponent(service)}${option ? `&option=${encodeURIComponent(option)}` : ""}` : "";

  // Görünen ayın müsait günleri (hizmet süresine göre)
  useEffect(() => {
    if (!serviceReady || !month || step !== 1) return;
    const controller = new AbortController();
    setDatesLoading(true);
    fetch(`/api/appointments/availability?${query}&month=${month}`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json()) as { dates?: DateKey[]; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Müsait günler alınamadı.");
        setAvailableDates(data.dates ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Müsait günler alınamadı.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDatesLoading(false);
      });
    return () => controller.abort();
  }, [serviceReady, month, query, step, refreshKey]);

  // Seçilen günün boş saatleri
  useEffect(() => {
    if (!date || !serviceReady) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlots([]);
    fetch(`/api/appointments/availability?${query}&date=${date}`, { signal: controller.signal })
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
  }, [date, serviceReady, query, refreshKey]);

  const onMonthChange = useCallback((m: string) => setMonth(m), []);

  const selectedSlot = slots.find((s) => s.start === time && s.available) ?? null;
  const notesValid = notes.trim().length >= NOTE_MIN && notes.length <= NOTE_MAX;
  const canContinue = [serviceReady, date !== null && selectedSlot !== null, notesValid, true][step];
  const label = service ? serviceLabel(service, option) : "";

  function chooseService(name: ServiceName) {
    setService(name);
    setOption(null);
    setDate(null);
    setTime(null);
    setAvailableDates([]);
    setError(null);
  }

  async function submit() {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: service, serviceOption: option, date, time, notes }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
      if (!res.ok) {
        setError(data.message ?? "Randevu oluşturulamadı.");
        if (data.code === "SLOT_TAKEN") {
          setTime(null);
          setRefreshKey((v) => v + 1);
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
          {label} · {formatDateLong(date)} · {selectedSlot.label}
        </p>
        <p className="mt-3 text-sm text-slate-500">Fizyoterapist talebinizi onayladığında e-posta ile bilgilendirileceksiniz.</p>
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
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {STEPS.map((stepLabel, i) => (
          <li key={stepLabel} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${i <= step ? "bg-teal-600" : "bg-slate-200"}`} />
            <span
              className={`text-xs font-medium sm:text-sm ${i === step ? "text-teal-800" : "text-slate-500"}`}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="hidden sm:inline">{i + 1}. </span>
              {stepLabel}
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
          <div className="space-y-6">
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
                      <input type="radio" name="service" value={s.name} checked={active} onChange={() => chooseService(s.name)} className="sr-only" />
                      <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                        {s.name}
                        {active && <Check className="size-5 text-teal-700" aria-hidden="true" />}
                      </span>
                      <span className="mt-1 text-sm text-slate-500">
                        {s.durationMinutes} dakika
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {needsOption && serviceDef?.options && (
              <fieldset>
                <legend className="font-semibold text-slate-900">{serviceDef.name} — uygulama seçin</legend>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
                  {serviceDef.options.map((o) => {
                    const active = option === o.name;
                    return (
                      <button
                        key={o.slug}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setOption(o.name);
                          setDate(null);
                          setTime(null);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                          active ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                        }`}
                      >
                        {o.name}
                        <span className={`ml-1.5 text-xs ${active ? "text-teal-100" : "text-slate-400"}`}>
                          {serviceDurationMinutes(serviceDef.name, o.name)} dk
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tarih ve saat seçin</h2>
            <p className="mt-1 text-sm text-slate-500">
              {label} · {service ? serviceDurationMinutes(service, option) : 0} dakika
            </p>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <Calendar
                  value={date}
                  onChange={(key) => {
                    setDate(key);
                    setTime(null);
                    setError(null);
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  availableDates={availableDates}
                  onMonthChange={onMonthChange}
                  loading={datesLoading}
                />
                {!datesLoading && month && availableDates.length === 0 && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Bu ay için online randevuya açık gün bulunmuyor. Sonraki aya bakabilir veya bizi telefonla arayabilirsiniz.
                  </p>
                )}
              </div>
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
                      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Bu gün randevuya kapalı. Lütfen başka bir gün seçin.</p>
                    ) : (
                      <>
                      {!slots.some((s) => s.available) && (
                        <p className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Bu günün tüm saatleri dolu. Lütfen başka bir gün seçin.</p>
                      )}
                      <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Müsait saatler">
                        {slots.map((slot) => {
                          const active = slot.available && time === slot.start;
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              disabled={!slot.available}
                              aria-label={slot.available ? slot.label : `${slot.label} (dolu)`}
                              onClick={() => setTime(slot.start)}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium tabular-nums ring-1 transition ${
                                !slot.available
                                  ? "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                                  : active
                                    ? "bg-teal-700 text-white ring-teal-700"
                                    : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                              }`}
                            >
                              <Clock className="size-4" aria-hidden="true" />
                              {slot.available ? slot.label : <span className="line-through">{slot.label}</span>}
                              {!slot.available && <span className="text-xs font-semibold no-underline">Dolu</span>}
                            </button>
                          );
                        })}
                      </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label htmlFor="notes" className="text-lg font-semibold text-slate-900">
              Şikâyet açıklaması
            </label>
            <p className="mt-1 text-sm text-slate-500">
              Başvuru nedeninizi kısaca yazın (ör. &quot;3 haftadır bel ağrısı&quot;). Gereksiz ayrıntılı sağlık geçmişi veya
              başka kişilere ait sağlık bilgisi paylaşmayınız. Bu bilgi sağlık verisidir; nasıl işlendiğini{" "}
              <Link href="/kvkk" target="_blank" className="font-medium text-teal-700 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;nde bulabilirsiniz.
            </p>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              maxLength={NOTE_MAX}
              required
              aria-invalid={notes.length > 0 && !notesValid ? true : undefined}
              placeholder="Şikâyetinizi kısaca yazın"
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
                ["Hizmet", label],
                ["Tarih", formatDateLong(date)],
                ["Saat", selectedSlot.label],
                ["Şikâyet", notes.trim()],
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
              {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CalendarCheck className="size-4" aria-hidden="true" />}
              {submitting ? "Gönderiliyor..." : "Randevu Talebini Gönder"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
