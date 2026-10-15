import type { ServiceName } from "@/lib/services";

export const APPOINTMENT_STATUSES = ["pending", "approved", "rejected", "completed", "cancelled"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Hastanın "aktif" (henüz gerçekleşmemiş) randevu durumları */
export const ACTIVE_STATUSES = ["pending", "approved"] as const satisfies readonly AppointmentStatus[];

/** Takvimde slotu dolu sayan durumlar (tamamlanan seansın saati de dolu kalır) */
export const SLOT_BLOCKING_STATUSES = ["pending", "approved", "completed"] as const satisfies readonly AppointmentStatus[];

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && (APPOINTMENT_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

export const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-teal-50 text-teal-800 ring-teal-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  cancelled: "bg-slate-50 text-slate-500 ring-slate-200",
};

/** Admin'in bir durumdan geçebileceği durumlar */
export const ADMIN_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["completed", "cancelled"],
  rejected: [],
  completed: [],
  cancelled: [],
};

/** Hasta yalnızca beklemedeki randevusunu iptal edebilir */
export const PATIENT_CANCELLABLE: readonly AppointmentStatus[] = ["pending"];

export const SLOT_DURATION_MINUTES = 60;
/** Bugünden itibaren kaç gün sonrasına randevu alınabilir */
export const BOOKING_WINDOW_DAYS = 60;
/** Bir hastanın aynı anda sahip olabileceği en fazla aktif (bekleyen/onaylı) randevu */
export const MAX_ACTIVE_APPOINTMENTS_PER_PATIENT = 3;

/** İstemciye gönderilen sade randevu verisi */
export type AppointmentDTO = {
  id: string;
  serviceName: ServiceName;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string; // ISO
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
};
