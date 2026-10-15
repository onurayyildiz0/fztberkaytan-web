import { CalendarDays, Clock, MessageSquareText } from "lucide-react";
import CancelAppointmentButton from "@/components/patient/CancelAppointmentButton";
import { StatusBadge } from "@/components/panel/ui";
import { PATIENT_CANCELLABLE, type AppointmentDTO } from "@/lib/appointments";
import { formatDateLong } from "@/lib/dates";

export default function PatientAppointmentItem({
  appointment: a,
  allowCancel = true,
}: {
  appointment: AppointmentDTO;
  allowCancel?: boolean;
}) {
  return (
    <li className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{a.serviceName}</p>
          <StatusBadge status={a.status} />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
            {formatDateLong(a.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-slate-400" aria-hidden="true" />
            {a.timeSlot}
          </span>
        </div>
        {a.notes && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="line-clamp-2">{a.notes}</span>
          </p>
        )}
      </div>
      {allowCancel && PATIENT_CANCELLABLE.includes(a.status) && <CancelAppointmentButton appointmentId={a.id} />}
    </li>
  );
}
