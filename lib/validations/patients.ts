import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalıdır.")
    .max(100, "Ad soyad en fazla 100 karakter olabilir."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{10,20}$/, "Geçerli bir telefon numarası girin.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin.")
    .max(254)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: optionalText(2000),
});

export type PatientInput = z.input<typeof patientSchema>;
