"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Mail, MessageSquareText, Phone, Stethoscope, User, X } from "lucide-react";
import StatusActions from "@/components/admin/StatusActions";
import { StatusBadge } from "@/components/panel/ui";
import type { AppointmentDTO } from "@/lib/appointments";
import { formatDateLong, formatTimestamp } from "@/lib/dates";

type Props = {
  appointment: AppointmentDTO | null;
  onClose: () => void;
};

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
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50"
      aria-labelledby="randevu-detay-baslik"
    >
      {appointment && (
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 id="randevu-detay-baslik" className="text-lg font-bold text-slate-900">
                Randevu Detayı
              </h2>
              <div className="mt-1.5">
                <StatusBadge status={appointment.status} />
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
            <Row icon={Stethoscope} label="Hizmet" value={appointment.serviceName} />
            <Row icon={CalendarDays} label="Tarih" value={formatDateLong(appointment.date)} />
            <Row icon={Clock} label="Saat" value={appointment.timeSlot} />
            <Row
              icon={MessageSquareText}
              label="Hasta notu"
              value={<span className="whitespace-pre-wrap">{appointment.notes || "-"}</span>}
            />
            <p className="text-xs text-slate-400">Talep tarihi: {formatTimestamp(appointment.createdAt)}</p>
          </dl>

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
