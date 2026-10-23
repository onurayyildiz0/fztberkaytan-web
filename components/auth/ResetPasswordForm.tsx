"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheckBig, KeyRound, LoaderCircle } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { resetPasswordFormSchema, toFieldErrors, type FieldErrors } from "@/lib/validations/auth";

type Values = { password: string; confirmPassword: string };

export default function ResetPasswordForm({ token }: { token: string }) {
  const [values, setValues] = useState<Values>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const parsed = resetPasswordFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error) as FieldErrors<Values>);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: parsed.data.password }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setFormError(data.message ?? "Şifre güncellenemedi.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheckBig className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm text-slate-600">Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.</p>
        <Link
          href="/giris-yap"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <FormAlert type="error" message={formError} />}
      <FormField
        id="password"
        label="Yeni şifre"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => {
          setValues((v) => ({ ...v, password: e.target.value }));
          setErrors((er) => ({ ...er, password: undefined }));
        }}
        error={errors.password}
        hint="En az 8 karakter; en az bir harf ve bir rakam içermelidir."
        disabled={loading}
        required
      />
      <FormField
        id="confirmPassword"
        label="Yeni şifre (tekrar)"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(e) => {
          setValues((v) => ({ ...v, confirmPassword: e.target.value }));
          setErrors((er) => ({ ...er, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-70"
      >
        {loading ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <KeyRound className="size-5" aria-hidden="true" />}
        Şifreyi Güncelle
      </button>
    </form>
  );
}
