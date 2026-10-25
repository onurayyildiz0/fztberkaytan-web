import { z } from "zod";
import { isDateKey, todayKey } from "@/lib/dates";

export const GENDERS = ["kadin", "erkek", "belirtilmemis"] as const;
export type Gender = (typeof GENDERS)[number];
export const GENDER_LABELS: Record<Gender, string> = {
  kadin: "Kadın",
  erkek: "Erkek",
  belirtilmemis: "Belirtmek istemiyor",
};

/** T.C. kimlik numarası: 11 hane, ilk hane 0 olamaz, 10. ve 11. haneler kontrol basamağıdır */
export function isValidTcNo(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!;
  const even = d[1]! + d[3]! + d[5]! + d[7]!;
  const d10 = (((odd * 7 - even) % 10) + 10) % 10;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d[9] === d10 && d[10] === d11;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalPhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{10,20}$/, "Geçerli bir telefon numarası girin.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const patientSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ad soyad en az 2 karakter olmalıdır.")
      .max(100, "Ad soyad en fazla 100 karakter olabilir."),
    tcNo: z
      .string()
      .trim()
      .refine((v) => v === "" || isValidTcNo(v), "Geçerli bir T.C. kimlik numarası girin.")
      .optional()
      .transform((v) => (v ? v : undefined)),
    birthDate: z
      .string()
      .trim()
      .refine((v) => v === "" || (isDateKey(v) && v <= todayKey() && v >= "1900-01-01"), "Geçerli bir doğum tarihi girin.")
      .optional()
      .transform((v) => (v ? v : undefined)),
    gender: z
      .enum(GENDERS)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phone: optionalPhone,
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Geçerli bir e-posta adresi girin.")
      .max(254)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    complaint: optionalText(2000),
    findings: optionalText(4000),
    referringPhysician: optionalText(150),
    emergencyContactName: optionalText(100),
    emergencyContactPhone: optionalPhone,
    notes: optionalText(2000),
  })
  .refine((d) => !d.emergencyContactPhone || !!d.emergencyContactName, {
    message: "Acil durumda aranacak kişinin adını girin.",
    path: ["emergencyContactName"],
  });

export type PatientInput = z.input<typeof patientSchema>;
export type PatientData = z.output<typeof patientSchema>;

/** Formlarda kullanılan alan listesi (sıra = ekrandaki sıra) */
export const PATIENT_TEXT_FIELDS = [
  "name",
  "tcNo",
  "birthDate",
  "gender",
  "phone",
  "email",
  "emergencyContactName",
  "emergencyContactPhone",
  "referringPhysician",
  "complaint",
  "findings",
  "notes",
] as const;
export type PatientFormValues = Record<(typeof PATIENT_TEXT_FIELDS)[number], string>;

export const EMPTY_PATIENT_FORM: PatientFormValues = Object.fromEntries(
  PATIENT_TEXT_FIELDS.map((k) => [k, ""]),
) as PatientFormValues;
