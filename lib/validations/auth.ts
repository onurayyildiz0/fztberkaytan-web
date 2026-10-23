import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur.").max(128),
});

/** Ortak alan kuralları */
export const nameField = z
  .string()
  .trim()
  .min(2, "Ad soyad en az 2 karakter olmalıdır.")
  .max(100, "Ad soyad en fazla 100 karakter olabilir.");

export const passwordField = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır.")
  .max(128, "Şifre en fazla 128 karakter olabilir.")
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermelidir.")
  .regex(/\d/, "Şifre en az bir rakam içermelidir.");

export const phoneField = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{10,20}$/, "Geçerli bir telefon numarası girin.")
  .optional()
  .or(z.literal("").transform(() => undefined));

const emailField = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin.").max(254);

/** Yasal metinlerin (KVKK aydınlatma + kullanım koşulları) sürümü; metin değişince güncellenir */
export const CONSENT_VERSION = "2026-10-19";

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  phone: phoneField,
  consent: z.literal(true, "Devam etmek için KVKK Aydınlatma Metni'ni okuduğunuzu ve Kullanım Koşulları'nı kabul ettiğinizi onaylayın."),
});

/** Kayıt formu: sunucu şemasına ek olarak şifre tekrarı kontrolü */
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(100),
  password: passwordField,
});

export const resetPasswordFormSchema = z
  .object({ password: passwordField, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: "Şifreler eşleşmiyor.", path: ["confirmPassword"] });

export const profileSchema = z.object({ name: nameField, phone: phoneField });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifrenizi girin.").max(128),
  newPassword: passwordField,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Şifrenizi girin.").max(128),
  confirmText: z.literal("SİL", "Onaylamak için SİL yazın."),
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
