import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";
import { isDateKey, isTime } from "@/lib/dates";
import { SERVICE_NAMES } from "@/lib/services";

const dateKey = z.string().refine(isDateKey, "Geçerli bir tarih seçin.");
const time = z.string().refine(isTime, "Geçerli bir saat seçin.");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Geçersiz kayıt.");

export const createAppointmentSchema = z.object({
  serviceName: z.enum(SERVICE_NAMES, "Lütfen bir hizmet seçin."),
  date: dateKey,
  time,
  notes: z.string().trim().max(1000, "Not en fazla 1000 karakter olabilir.").optional().default(""),
});

/** Fizyoterapistin randevu oluşturması (onaylı olarak kaydedilir) */
export const adminCreateAppointmentSchema = z.object({
  patientId: objectId,
  serviceName: z.enum(SERVICE_NAMES, "Lütfen bir hizmet seçin."),
  date: dateKey,
  time,
  notes: z.string().trim().max(1000).optional().default(""),
  adminNotes: z.string().trim().max(2000).optional().default(""),
  /** Çalışma saatleri / kapalı gün / Google dolu saat kontrolünü atla (yalnızca çakışma kontrolü yapılır) */
  allowOutsideHours: z.boolean().optional().default(false),
  /** Hastaya bilgilendirme e-postası gönderilsin mi */
  notifyPatient: z.boolean().optional().default(true),
});

export const updateAppointmentSchema = z
  .object({
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.status !== undefined || d.adminNotes !== undefined, "Güncellenecek bir alan gönderin.");

export const rescheduleSchema = z.object({
  date: dateKey,
  time,
  allowOutsideHours: z.boolean().optional().default(false),
  notifyPatient: z.boolean().optional().default(true),
});

export const closedDaySchema = z.object({
  date: dateKey,
  reason: z.string().trim().max(120).optional().default(""),
});

export const workingHoursSchema = z.object({
  days: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        isDayOff: z.boolean(),
        slots: z.array(time).max(24),
      }),
    )
    .length(7)
    .refine((days) => new Set(days.map((d) => d.dayOfWeek)).size === 7, "Her gün bir kez gönderilmelidir."),
});

export type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;
export type AdminCreateAppointmentInput = z.input<typeof adminCreateAppointmentSchema>;
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;
