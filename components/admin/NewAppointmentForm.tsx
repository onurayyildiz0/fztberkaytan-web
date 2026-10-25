"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, Globe, LoaderCircle, Search, UserPlus, X } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import { formatDateLong, isTime, todayKey } from "@/lib/dates";
import { SERVICES, getService, serviceDurationMinutes, type ServiceName } from "@/lib/services";

export type PickedPatient = { id: string; name: string; phone: string | null; email: string | null; hasAccount: boolean };
type Slot = { start: string; label: string };

type Props = {
  initialPatient: PickedPatient | null;
  initialDate?: string;
  initialTime?: string;
};

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none";

export default function NewAppointmentForm({ initialPatient, initialDate, initialTime }: Props) {
  const router = useRouter();
  const [patient, setPatient] = useState<PickedPatient | null>(initialPatient);
  const [service, setService] = useState<ServiceName>(SERVICES[0].name);
  const serviceOptions = getService(service)?.options ?? [];
  const [option, setOption] = useState<string | null>(null);
  const optionReady = serviceOptions.length === 0 || !!option;
  const duration = serviceDurationMinutes(service, option);
  const [date, setDate] = useState(initialDate ?? todayKey());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState(initialTime ?? "");
  const [outside, setOutside] = useState(false);
  const [customTime, setCustomTime] = useState(initialTime ?? "");
  const [notes, setNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !optionReady) return;
    const controller = new AbortController();
    setSlots(null);
    fetch(`/api/admin/availability?date=${date}&duration=${duration}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { slots?: Slot[] }) => {
        const list = d.slots ?? [];
        setSlots(list);
        // Takvimden gelinen saat müsait değilse "özel saat" moduna geç
        if (initialTime && date === initialDate && !list.some((s) => s.start === initialTime)) setOutside(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [date, initialDate, initialTime, duration, optionReady]);

  const chosenTime = outside ? customTime : time;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patient) return setError("Lütfen bir hasta seçin.");
    if (!optionReady) return setError("Lütfen hizmet seçeneğini seçin.");
    if (!isTime(chosenTime)) return setError("Lütfen bir saat seçin.");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          serviceName: service,
          serviceOption: option,
          date,
          time: chosenTime,
          notes,
          adminNotes,
          allowOutsideHours: outside,
          notifyPatient: notify && !!patient.email,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "Randevu oluşturulamadı.");
        return;
      }
      router.push(`/admin/takvim?tarih=${date}`);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <FormAlert type="error" message={error} />}

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">1. Hasta</legend>
        <div className="mt-2">
          {patient ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 px-4 py-3 ring-1 ring-teal-200">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  {patient.name}
                  {patient.hasAccount && <Globe className="size-3.5 text-teal-700" aria-label="Online hesabı var" />}
                </p>
                <p className="truncate text-xs text-slate-600">{[patient.phone, patient.email].filter(Boolean).join(" · ") || "İletişim bilgisi yok"}</p>
              </div>
              <button
                type="button"
                onClick={() => setPatient(null)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white"
                aria-label="Hasta seçimini kaldır"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <PatientPicker onPick={setPatient} />
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">2. Hizmet</legend>
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value as ServiceName);
            setOption(null);
            setTime("");
          }}
          aria-label="Hizmet"
          className={`mt-2 ${inputClass}`}
        >
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name} ({s.durationMinutes} dk)
            </option>
          ))}
        </select>
        {serviceOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Hizmet seçeneği">
            {serviceOptions.map((o) => (
              <button
                key={o.slug}
                type="button"
                role="radio"
                aria-checked={option === o.name}
                onClick={() => {
                  setOption(o.name);
                  setTime("");
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ${
                  option === o.name ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">3. Tarih ve saat</legend>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="date"
            min={todayKey()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");
            }}
            aria-label="Tarih"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          {date && <span className="text-sm text-slate-500">{formatDateLong(date)}</span>}
        </div>

        {!outside && (
          <div className="mt-3">
            {slots === null ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Müsait saatler yükleniyor...
              </p>
            ) : slots.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                Bu gün için Google müsaitlik takviminde uygun boş saat yok. Gerekirse aşağıdan özel saat seçebilirsiniz.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Müsait saatler">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    role="radio"
                    aria-checked={time === s.start}
                    onClick={() => setTime(s.start)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium tabular-nums ring-1 transition ${
                      time === s.start ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={outside} onChange={(e) => setOutside(e.target.checked)} />
          Müsaitlik dışında / özel saat (yalnızca başka randevuyla çakışma kontrol edilir)
        </label>
        {outside && (
          <input
            type="time"
            step={300}
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            aria-label="Özel saat"
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-slate-800">4. Notlar (isteğe bağlı)</legend>
        <div>
          <label htmlFor="appt-notes" className="text-xs font-medium text-slate-600">
            Şikâyet açıklaması
          </label>
          <textarea id="appt-notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-1 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="appt-admin-notes" className="text-xs font-medium text-slate-600">
            Özel not (hasta görmez)
          </label>
          <textarea
            id="appt-admin-notes"
            rows={3}
            maxLength={2000}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </fieldset>

      <label className={`flex items-center gap-2 text-sm ${patient?.email ? "text-slate-700" : "text-slate-400"}`}>
        <input type="checkbox" checked={notify && !!patient?.email} disabled={!patient?.email} onChange={(e) => setNotify(e.target.checked)} />
        Hastaya e-posta ile bilgi gönder {patient && !patient.email && "(hastanın e-postası kayıtlı değil)"}
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Link href="/admin/takvim" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CalendarPlus className="size-4" aria-hidden="true" />}
          Randevuyu Oluştur
        </button>
      </div>
    </form>
  );
}

/** Hasta arama + aynı ekranda yeni hasta ekleme */
function PatientPicker({ onPick }: { onPick: (p: PickedPatient) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PickedPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", email: "" });
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/patients?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d: { patients?: PickedPatient[] }) => setResults(d.patients ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  async function createPatient() {
    setCreateError(null);
    const res = await fetch("/api/admin/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatient),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { id?: string; message?: string; existingId?: string } | undefined;
    if (!res?.ok || !data?.id) {
      setCreateError(data?.message ?? "Hasta kaydedilemedi.");
      return;
    }
    onPick({
      id: data.id,
      name: newPatient.name.trim(),
      phone: newPatient.phone.trim() || null,
      email: newPatient.email.trim().toLowerCase() || null,
      hasAccount: false,
    });
  }

  if (creating) {
    return (
      <div className="space-y-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-800">Yeni hasta</p>
        {createError && <FormAlert type="error" message={createError} />}
        <input
          placeholder="Ad Soyad *"
          aria-label="Ad Soyad"
          value={newPatient.name}
          onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))}
          className={inputClass}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Telefon"
            aria-label="Telefon"
            type="tel"
            value={newPatient.phone}
            onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))}
            className={inputClass}
          />
          <input
            placeholder="E-posta"
            aria-label="E-posta"
            type="email"
            value={newPatient.email}
            onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setCreating(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200">
            Vazgeç
          </button>
          <button
            type="button"
            onClick={createPatient}
            disabled={newPatient.name.trim().length < 2}
            className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            Kaydet ve Seç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl ring-1 ring-slate-200">
      <div className="relative border-b border-slate-100">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hasta ara (ad, telefon, e-posta)"
          aria-label="Hasta ara"
          className="w-full rounded-t-xl py-2.5 pr-3 pl-10 text-sm focus:outline-none"
        />
      </div>
      <ul className="max-h-60 overflow-y-auto" aria-busy={loading}>
        {results.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-teal-50">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">{p.name}</span>
                <span className="block truncate text-xs text-slate-500">{[p.phone, p.email].filter(Boolean).join(" · ") || "-"}</span>
              </span>
              {p.hasAccount && <Globe className="size-3.5 shrink-0 text-teal-700" aria-label="Online hesabı var" />}
            </button>
          </li>
        ))}
        {!loading && results.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">Hasta bulunamadı.</li>}
      </ul>
      <button
        type="button"
        onClick={() => {
          setCreating(true);
          setNewPatient((p) => ({ ...p, name: /\d/.test(q) ? p.name : q }));
        }}
        className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
      >
        <UserPlus className="size-4" aria-hidden="true" /> Yeni hasta ekle
      </button>
    </div>
  );
}
