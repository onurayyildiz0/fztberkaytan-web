"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CalendarSync,
  Clock,
  LoaderCircle,
  Lock,
  Mail,
  MessageSquareText,
  Phone,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import StatusActions from "@/components/admin/StatusActions";
import { StatusBadge } from "@/components/panel/ui";
import { RESCHEDULABLE_STATUSES, type AdminAppointmentDTO } from "@/lib/appointments";
import { formatDateLong, formatTimestamp, isTime, todayKey } from "@/lib/dates";
import { serviceLabel } from "@/lib/services";

type Props = {
  appointment: AdminAppointmentDTO | null;
  onClose: () => void;
};

const CANCELLED_BY_LABELS = { patient: "Hasta iptal etti", admin: "Fizyoterapist iptal etti", system: "Süresi geçtiği için otomatik düştü" };

export default function AppointmentDetailDialog({ appointment, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (appointment && !dialog.open) dialog.showModal();
    if (!appointment && dialog.open) dialog.close();
  }, [appointment]);

  const p = appointment?.patient;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50"
      aria-labelledby="randevu-detay-baslik"
    >
      {appointment && (
        <div key={appointment.id}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 id="randevu-detay-baslik" className="text-lg font-bold text-slate-900">
                Randevu Detayı
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={appointment.status} />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {appointment.source === "admin" ? "Klinikten oluşturuldu" : "Online talep"}
                </span>
                {appointment.googleSynced && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <CalendarSync className="size-3" aria-hidden="true" /> Google Takvim&apos;de
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Kapat"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <dl className="space-y-4 px-6 py-5 text-sm">
            <Row
              icon={User}
              label="Hasta"
              value={
                p ? (
                  <Link href={`/admin/hastalar/${p.id}`} className="text-teal-700 hover:underline">
                    {p.name} →
                  </Link>
                ) : (
                  "Silinmiş hasta"
                )
              }
            />
            {p?.email && (
              <Row
                icon={Mail}
                label="E-posta"
                value={
                  <a href={`mailto:${p.email}`} className="text-teal-700 hover:underline">
                    {p.email}
                  </a>
                }
              />
            )}
            <Row
              icon={Phone}
              label="Telefon"
              value={
                p?.phone ? (
                  <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="text-teal-700 hover:underline">
                    {p.phone}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <Row icon={Stethoscope} label="Hizmet" value={`${serviceLabel(appointment.serviceName, appointment.serviceOption)} · ${appointment.durationMinutes} dk`} />
            <Row icon={CalendarDays} label="Tarih" value={formatDateLong(appointment.date)} />
            <Row icon={Clock} label="Saat" value={appointment.timeSlot} />
            <Row
              icon={MessageSquareText}
              label="Şikâyet açıklaması"
              value={<span className="whitespace-pre-wrap">{appointment.notes || "-"}</span>}
            />
            <p className="text-xs text-slate-400">
              Oluşturulma: {formatTimestamp(appointment.createdAt)}
              {appointment.cancelledBy && ` · ${CANCELLED_BY_LABELS[appointment.cancelledBy]}`}
            </p>
          </dl>

          <div className="space-y-5 border-t border-slate-100 px-6 py-5">
            <PendingProposal appointment={appointment} />
            <AdminNotes appointment={appointment} />
            {RESCHEDULABLE_STATUSES.includes(appointment.status) && (
              <Reschedule appointment={appointment} onDone={onClose} />
            )}
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
            <StatusActions appointmentId={appointment.id} status={appointment.status} onDone={onClose} />
          </div>
        </div>
      )}
    </dialog>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 font-medium break-words text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

/** Yalnızca fizyoterapistin gördüğü not */
function AdminNotes({ appointment }: { appointment: AdminAppointmentDTO }) {
  const router = useRouter();
  const [value, setValue] = useState(appointment.adminNotes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = value !== appointment.adminNotes;

  async function save() {
    setState("saving");
    const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: value }),
    }).catch(() => null);
    setState(res?.ok ? "saved" : "error");
    if (res?.ok) router.refresh();
  }

  return (
    <div>
      <label htmlFor={`admin-not-${appointment.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <Lock className="size-3.5 text-slate-400" aria-hidden="true" /> Özel not
        <span className="font-normal text-slate-400">(hasta görmez)</span>
      </label>
      <textarea
        id={`admin-not-${appointment.id}`}
        rows={2}
        maxLength={2000}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        placeholder="Seans notu, hatırlatma vb."
        className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
      />
      <div className="mt-1.5 flex items-center justify-end gap-3 text-xs">
        {state === "saved" && <span className="text-emerald-600">Kaydedildi</span>}
        {state === "error" && <span className="text-red-600">Kaydedilemedi</span>}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || state === "saving"}
          className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-white hover:bg-slate-900 disabled:opacity-40"
        >
          {state === "saving" ? "Kaydediliyor..." : "Notu Kaydet"}
        </button>
      </div>
    </div>
  );
}

type Slot = { start: string; label: string };

/** Bekleyen erteleme önerisi (hasta onayı bekleniyor) */
function PendingProposal({ appointment }: { appointment: AdminAppointmentDTO }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (!appointment.proposal) return null;

  async function withdraw() {
    setLoading(true);
    await fetch(`/api/admin/appointments/${appointment.id}/reschedule`, { method: "DELETE" }).catch(() => null);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
      <p className="font-semibold">Hasta onayı bekleniyor</p>
      <p className="mt-1">
        Önerilen yeni tarih: {formatDateLong(appointment.proposal.date)} · {appointment.proposal.timeSlot}. Hasta kabul
        edince randevu taşınır; reddederse iptal olur.
      </p>
      <button
        type="button"
        onClick={withdraw}
        disabled={loading}
        className="mt-2 text-xs font-semibold text-amber-800 underline disabled:opacity-50"
      >
        Öneriyi geri çek
      </button>
    </div>
  );
}

/** Tarih / saat değiştirme: hastaya öner veya telefonda onaylandıysa doğrudan taşı */
function Reschedule({ appointment, onDone }: { appointment: AdminAppointmentDTO; onDone: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"propose" | "confirmed">(appointment.patientHasAccount ? "propose" : "confirmed");
  const [date, setDate] = useState(appointment.date);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState<string>("");
  const [outside, setOutside] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !date) return;
    const controller = new AbortController();
    setSlots(null);
    setTime("");
    fetch(`/api/admin/availability?date=${date}&duration=${appointment.durationMinutes}&exclude=${appointment.id}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d: { slots?: Slot[] }) => setSlots(d.slots ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [open, date, appointment.id, appointment.durationMinutes]);

  const chosenTime = outside ? customTime : time;

  async function submit() {
    if (!isTime(chosenTime)) {
      setError("Lütfen bir saat seçin.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time: chosenTime, mode, allowOutsideHours: outside, notifyPatient: notify }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "Ertelenemedi.");
        return;
      }
      onDone();
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-800"
      >
        <CalendarClock className="size-4" aria-hidden="true" /> {appointment.proposal ? "Yeni öneri yap" : "Tarih / Saat Değiştir"}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <CalendarClock className="size-4" aria-hidden="true" /> Randevuyu ertele ({appointment.durationMinutes} dk)
      </p>
      {error && <FormAlert type="error" message={error} />}

      <fieldset className="space-y-1.5 text-sm">
        <legend className="sr-only">Erteleme yöntemi</legend>
        <label className={`flex items-start gap-2 ${appointment.patientHasAccount ? "text-slate-700" : "text-slate-400"}`}>
          <input
            type="radio"
            name={`mode-${appointment.id}`}
            checked={mode === "propose"}
            disabled={!appointment.patientHasAccount}
            onChange={() => setMode("propose")}
            className="mt-0.5"
          />
          <span>
            Hastaya öner — hasta panelden kabul edince kesinleşir
            {!appointment.patientHasAccount && " (hastanın online hesabı yok)"}
          </span>
        </label>
        <label className="flex items-start gap-2 text-slate-700">
          <input type="radio" name={`mode-${appointment.id}`} checked={mode === "confirmed"} onChange={() => setMode("confirmed")} className="mt-0.5" />
          <span>Hasta yeni saati kabul etti (ör. telefonda) — randevu hemen taşınır</span>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600" htmlFor={`ertele-tarih-${appointment.id}`}>
          Yeni tarih
        </label>
        <input
          id={`ertele-tarih-${appointment.id}`}
          type="date"
          min={todayKey()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        />
      </div>

      {!outside &&
        (slots === null ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Müsait saatler yükleniyor...
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-500">Bu gün için müsaitlik takviminde boş saat yok.</p>
        ) : (
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto" role="radiogroup" aria-label="Müsait saatler">
            {slots.map((s) => (
              <button
                key={s.start}
                type="button"
                role="radio"
                aria-checked={time === s.start}
                onClick={() => setTime(s.start)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums ring-1 ${
                  time === s.start ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                }`}
              >
                {s.start}
              </button>
            ))}
          </div>
        ))}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={outside} onChange={(e) => setOutside(e.target.checked)} />
        Müsaitlik dışında / özel saat
      </label>
      {outside && (
        <input
          type="time"
          step={300}
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
          aria-label="Özel saat"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        />
      )}
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Hastaya e-posta ile bildir
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">
          Vazgeç
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !chosenTime}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "propose" ? "Hastaya Öner" : "Taşı"}
        </button>
      </div>
    </div>
  );
}
