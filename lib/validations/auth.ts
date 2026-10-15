import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur.").max(128),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalıdır.")
    .max(100, "Ad soyad en fazla 100 karakter olabilir."),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin.").max(254),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(128, "Şifre en fazla 128 karakter olabilir.")
    .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermelidir.")
    .regex(/\d/, "Şifre en az bir rakam içermelidir."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{10,20}$/, "Geçerli bir telefon numarası girin.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Kayıt formu: sunucu şemasına ek olarak şifre tekrarı kontrolü */
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterFormInput = z.input<typeof registerFormSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Zod hatalarını alan başına ilk mesaja indirger */
export function toFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const result: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result as FieldErrors<T>;
}
