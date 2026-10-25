import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";
import { isDateKey, isTime } from "@/lib/dates";
import { SERVICE_NAMES, isValidServiceOption } from "@/lib/services";

const dateKey = z.string().refine(isDateKey, "Geçerli bir tarih seçin.");
const time = z.string().refine(isTime, "Geçerli bir saat seçin.");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Geçersiz kayıt.");
const serviceOption = z
  .string()
  .trim()
  .max(100)
  .nullish()
  .transform((v) => v || null);

/** Hizmetin alt seçeneği varsa seçim zorunlu, yoksa boş olmalı */
function withValidOption<T extends { serviceName: string; serviceOption: string | null }>(schema: z.ZodType<T>) {
  return schema.refine((d) => isValidServiceOption(d.serviceName, d.serviceOption), {
    message: "Lütfen hizmet seçeneğini seçin.",
    path: ["serviceOption"],
  });
}

/** Hastanın online randevu talebi */
export const createAppointmentSchema = withValidOption(
  z.object({
    serviceName: z.enum(SERVICE_NAMES, "Lütfen bir hizmet seçin."),
    serviceOption,
    date: dateKey,
    time,
    notes: z
      .string()
      .trim()
      .min(3, "Lütfen başvuru nedeninizi kısaca yazın.")
      .max(1000, "Şikâyet açıklaması en fazla 1000 karakter olabilir."),
  }),
);

/** Fizyoterapistin randevu oluşturması (onaylı olarak kaydedilir) */
export const adminCreateAppointmentSchema = withValidOption(
  z.object({
    patientId: objectId,
    serviceName: z.enum(SERVICE_NAMES, "Lütfen bir hizmet seçin."),
    serviceOption,
    date: dateKey,
    time,
    notes: z.string().trim().max(1000).optional().default(""),
    adminNotes: z.string().trim().max(2000).optional().default(""),
    /** Müsaitlik takvimi dışında da ekle (yalnızca diğer randevularla çakışma kontrol edilir) */
    allowOutsideHours: z.boolean().optional().default(false),
    /** Hastaya bilgilendirme e-postası gönderilsin mi */
    notifyPatient: z.boolean().optional().default(true),
  }),
);

export const updateAppointmentSchema = z
  .object({
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.status !== undefined || d.adminNotes !== undefined, "Güncellenecek bir alan gönderin.");

/**
 * Erteleme:
 * - "propose": yeni tarih hastaya önerilir, hasta panelden kabul edince kesinleşir (kullanım koşulları m.4)
 * - "confirmed": hasta yeni saati telefonda kabul etti; randevu doğrudan taşınır
 */
export const rescheduleSchema = z.object({
  date: dateKey,
  time,
  mode: z.enum(["propose", "confirmed"]).default("propose"),
  allowOutsideHours: z.boolean().optional().default(false),
  notifyPatient: z.boolean().optional().default(true),
});

/** Hastanın erteleme önerisine yanıtı */
export const proposalResponseSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;
export type AdminCreateAppointmentInput = z.input<typeof adminCreateAppointmentSchema>;
