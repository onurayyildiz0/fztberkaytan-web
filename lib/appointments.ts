import type { ServiceName } from "@/lib/services";

export const APPOINTMENT_STATUSES = ["pending", "approved", "rejected", "completed", "no_show", "cancelled"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Hastanın "aktif" (henüz gerçekleşmemiş) randevu durumları */
export const ACTIVE_STATUSES = ["pending", "approved"] as const satisfies readonly AppointmentStatus[];

/**
 * Takvimde slotu dolu sayan durumlar (tamamlanan seansın saati de dolu kalır).
 * Not: "no_show" yalnızca saati geçmiş randevulara verilir; geçmiş saatler zaten randevuya kapalıdır.
 */
export const SLOT_BLOCKING_STATUSES = ["pending", "approved", "completed"] as const satisfies readonly AppointmentStatus[];

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && (APPOINTMENT_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  completed: "Tamamlandı",
  no_show: "Gelmedi",
  cancelled: "İptal Edildi",
};

export const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-teal-50 text-teal-800 ring-teal-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  no_show: "bg-orange-50 text-orange-800 ring-orange-200",
  cancelled: "bg-slate-50 text-slate-500 ring-slate-200",
};

/** Takvim görünümündeki blok renkleri */
export const STATUS_BLOCK_CLASSES: Record<AppointmentStatus, string> = {
  pending: "border-amber-400 bg-amber-50 text-amber-900",
  approved: "border-teal-600 bg-teal-50 text-teal-900",
  rejected: "border-red-300 bg-red-50/60 text-red-800 line-through",
  completed: "border-slate-400 bg-slate-100 text-slate-700",
  no_show: "border-orange-400 bg-orange-50 text-orange-900",
  cancelled: "border-slate-300 bg-slate-50 text-slate-400 line-through",
};

/** Admin'in bir durumdan geçebileceği durumlar */
export const ADMIN_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["completed", "no_show", "cancelled"],
  rejected: [],
  completed: [],
  no_show: [],
  cancelled: [],
};

/** Ertelenebilen (tarih/saati değiştirilebilen) durumlar */
export const RESCHEDULABLE_STATUSES: readonly AppointmentStatus[] = ["pending", "approved"];

/** Hasta, randevuya bu kadar saatten fazla varken panelden iptal edebilir */
export const PATIENT_CANCEL_MIN_HOURS = 24;
export const PATIENT_CANCELLABLE: readonly AppointmentStatus[] = ["pending", "approved"];

export function canPatientCancel(status: AppointmentStatus, startsAt: Date, now = new Date()): boolean {
  return (
    PATIENT_CANCELLABLE.includes(status) &&
    startsAt.getTime() - now.getTime() > PATIENT_CANCEL_MIN_HOURS * 60 * 60 * 1000
  );
}

export const APPOINTMENT_SOURCES = ["online", "admin"] as const;
export type AppointmentSource = (typeof APPOINTMENT_SOURCES)[number];

export const CANCELLED_BY = ["patient", "admin", "system"] as const;
export type CancelledBy = (typeof CANCELLED_BY)[number];

export const SLOT_DURATION_MINUTES = 60;
/** Bugünden itibaren kaç gün sonrasına randevu alınabilir (hasta) */
export const BOOKING_WINDOW_DAYS = 60;
/** Bir hastanın aynı anda sahip olabileceği en fazla aktif (bekleyen/onaylı) online randevu */
export const MAX_ACTIVE_APPOINTMENTS_PER_PATIENT = 3;

/** İstemciye gönderilen sade randevu verisi */
export type AppointmentDTO = {
  id: string;
  serviceName: ServiceName;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  startsAt: string; // ISO
  status: AppointmentStatus;
  notes: string;
  source: AppointmentSource;
  createdAt: string; // ISO
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
};

/** Yalnızca admin görünümünde bulunan alanlar */
export type AdminAppointmentDTO = AppointmentDTO & {
  adminNotes: string;
  cancelledBy: CancelledBy | null;
  googleSynced: boolean;
};
