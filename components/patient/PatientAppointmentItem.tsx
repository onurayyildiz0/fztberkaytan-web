import { CalendarDays, CalendarPlus, Clock, MessageSquareText, Phone } from "lucide-react";
import CancelAppointmentButton from "@/components/patient/CancelAppointmentButton";
import { StatusBadge } from "@/components/panel/ui";
import {
  ACTIVE_STATUSES,
  PATIENT_CANCEL_MIN_HOURS,
  canPatientCancel,
  type AppointmentDTO,
} from "@/lib/appointments";
import { googleCalendarTemplateUrl } from "@/lib/calendar-links";
import { formatDateLong } from "@/lib/dates";
import { links, siteConfig } from "@/lib/site";

export default function PatientAppointmentItem({
  appointment: a,
  allowCancel = true,
}: {
  appointment: AppointmentDTO;
  allowCancel?: boolean;
}) {
  const startsAt = new Date(a.startsAt);
  const isUpcoming = startsAt > new Date();
  const isActive = (ACTIVE_STATUSES as readonly string[]).includes(a.status) && isUpcoming;
  const cancellable = allowCancel && canPatientCancel(a.status, startsAt);

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
        {a.status === "approved" && isUpcoming && (
          <a
            href={googleCalendarTemplateUrl(a)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
          >
            <CalendarPlus className="size-4" aria-hidden="true" /> Google Takvime Ekle
          </a>
        )}
      </div>

      {cancellable ? (
        <CancelAppointmentButton appointmentId={a.id} />
      ) : (
        allowCancel &&
        isActive && (
          // 24 saatten az kaldı: online iptal kapalı, telefon yönlendirmesi
          <p className="max-w-xs text-xs text-slate-500 sm:text-right">
            Randevuya {PATIENT_CANCEL_MIN_HOURS} saatten az kaldığı için iptal veya değişiklik için lütfen{" "}
            <a href={links.tel} className="inline-flex items-center gap-1 font-semibold text-teal-700">
              <Phone className="size-3" aria-hidden="true" /> {siteConfig.phoneDisplay}
            </a>{" "}
            numarasını arayın.
          </p>
        )
      )}
    </li>
  );
}
