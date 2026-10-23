"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import AppointmentDetailDialog from "@/components/admin/AppointmentDetailDialog";
import StatusActions from "@/components/admin/StatusActions";
import { EmptyState, StatusBadge } from "@/components/panel/ui";
import type { AdminAppointmentDTO } from "@/lib/appointments";
import { formatDateShort } from "@/lib/dates";

type AppointmentListProps = {
  appointments: AdminAppointmentDTO[];
  /** Satırda hızlı durum butonlarını göster */
  showActions?: boolean;
  /** Hasta adı yerine yalnızca hizmeti göster (hasta detay sayfası için) */
  hidePatient?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function AppointmentList({
  appointments,
  showActions = false,
  hidePatient = false,
  emptyTitle = "Randevu bulunamadı",
  emptyDescription,
}: AppointmentListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  if (appointments.length === 0) {
    return <EmptyState icon={CalendarX2} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {appointments.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"
              onClick={() => setSelectedId(a.id)}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
              aria-label={`${a.patient?.name ?? "Randevu"} – ${formatDateShort(a.date)} ${a.timeSlot} detaylarını aç`}
            >
              <div className="flex w-20 shrink-0 flex-col items-center rounded-xl bg-teal-50 px-2 py-2 text-teal-800">
                <span className="text-xs font-medium">{formatDateShort(a.date).split(" ").slice(0, 2).join(" ")}</span>
                <span className="text-sm font-bold tabular-nums">{a.timeSlot.split(" - ")[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {hidePatient ? a.serviceName : (a.patient?.name ?? "Silinmiş hasta")}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {hidePatient ? `${formatDateShort(a.date)} · ${a.timeSlot}` : `${a.serviceName} · ${a.timeSlot}`}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={a.status} />
                </div>
              </div>
            </button>
            {showActions && <StatusActions appointmentId={a.id} status={a.status} />}
          </li>
        ))}
      </ul>
      <AppointmentDetailDialog appointment={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
