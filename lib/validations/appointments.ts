import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";
import { isDateKey, isTime } from "@/lib/dates";
import { SERVICE_NAMES } from "@/lib/services";

const dateKey = z.string().refine(isDateKey, "Geçerli bir tarih seçin.");
const time = z.string().refine(isTime, "Geçerli bir saat seçin.");

export const createAppointmentSchema = z.object({
  serviceName: z.enum(SERVICE_NAMES, "Lütfen bir hizmet seçin."),
  date: dateKey,
  time,
  notes: z.string().trim().max(1000, "Not en fazla 1000 karakter olabilir.").optional().default(""),
});

export const updateStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
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
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;
