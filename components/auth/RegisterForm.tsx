"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck, UserPlus } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import {
  registerFormSchema,
  toFieldErrors,
  type FieldErrors,
  type RegisterFormInput,
} from "@/lib/validations/auth";

// Onay kutusu başlangıçta işaretsizdir; şema yalnızca "true" kabul eder
type FormValues = Omit<Required<RegisterFormInput>, "consent"> & { consent: boolean };

type RegisterResponse = {
  message: string;
  errors?: FieldErrors<FormValues>;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  consent: false,
};

export default function RegisterForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<FormValues>>({});
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);

    const parsed = registerFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    // Şifre tekrarı sunucuya gönderilmez
    const { name, email, phone, password, consent } = parsed.data;
    const payload = { name, email, phone, password, consent };

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({ message: "" }))) as RegisterResponse;

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setAlert({ type: "error", message: data.message || "Kayıt başarısız oldu." });
        return;
      }

      setSentTo(email);
      setValues(initialValues);
    } catch {
      setAlert({ type: "error", message: "Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin." });
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading;

  if (sentTo) {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">E-postanızı kontrol edin</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong className="text-slate-900">{sentTo}</strong> adresine bir doğrulama bağlantısı gönderdik. Hesabınızı
          etkinleştirmek için bağlantıya tıklayın.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          E-posta birkaç dakika içinde gelmezse spam/gereksiz klasörünü kontrol edin. Bağlantı 24 saat geçerlidir.
        </p>
        <Link
          href="/giris-yap"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Giriş sayfasına git
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {alert && <FormAlert type={alert.type} message={alert.message} />}

      <FormField
        id="name"
        label="Ad Soyad"
        autoComplete="name"
        placeholder="Adınız Soyadınız"
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        disabled={disabled}
        required
      />
      <FormField
        id="email"
        label="E-posta"
        type="email"
        autoComplete="email"
        placeholder="ornek@eposta.com"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
        disabled={disabled}
        required
      />
      <FormField
        id="phone"
        label="Telefon (isteğe bağlı)"
        type="tel"
        autoComplete="tel"
        placeholder="05xx xxx xx xx"
        value={values.phone}
        onChange={(e) => update("phone", e.target.value)}
        error={errors.phone}
        disabled={disabled}
      />
      <FormField
        id="password"
        label="Şifre"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
        hint="En az 8 karakter; en az bir harf ve bir rakam içermelidir."
        disabled={disabled}
        required
      />
      <FormField
        id="confirmPassword"
        label="Şifre (Tekrar)"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={values.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        disabled={disabled}
        required
      />

      <div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            disabled={disabled}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-teal-700"
          />
          <span>
            <Link href="/kvkk" target="_blank" className="font-medium text-teal-700 underline">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum ve{" "}
            <Link href="/kullanim-kosullari" target="_blank" className="font-medium text-teal-700 underline">
              Kullanım Koşulları
            </Link>
            &apos;nı kabul ediyorum.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1.5 text-sm text-red-600">
            {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="size-5" aria-hidden="true" />
        )}
        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
}
