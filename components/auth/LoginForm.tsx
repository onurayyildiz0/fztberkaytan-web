"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { LoaderCircle, LogIn, MailCheck } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { isRole, resolveRedirect } from "@/lib/auth/roles";
import { loginSchema, toFieldErrors, type FieldErrors, type LoginInput } from "@/lib/validations/auth";

const ERROR_MESSAGES: Record<string, string> = {
  too_many_attempts: "Çok fazla başarısız giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
  email_not_verified:
    "E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki (ve spam klasöründeki) doğrulama bağlantısına tıklayın.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const justVerified = searchParams.get("dogrulama") === "basarili";

  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resendState, setResendState] = useState<{ loading: boolean; message: string | null }>({
    loading: false,
    message: null,
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof LoginInput>(key: K, value: LoginInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setUnverified(false);
    setResendState({ loading: false, message: null });

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", { ...parsed.data, redirect: false });

      if (!result || result.error) {
        const code = result?.code ?? "";
        setUnverified(code === "email_not_verified");
        setFormError(ERROR_MESSAGES[code] ?? "E-posta adresi veya şifre hatalı.");
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      if (!isRole(role)) {
        setFormError("Oturum bilgisi alınamadı. Lütfen tekrar deneyin.");
        return;
      }

      router.replace(resolveRedirect(role, callbackUrl));
      router.refresh();
    } catch {
      setFormError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setResendState({ loading: true, message: null });
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setResendState({ loading: false, message: data.message ?? "İstek gönderildi." });
    } catch {
      setResendState({ loading: false, message: "Sunucuya ulaşılamadı." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {justVerified && !formError && (
        <FormAlert type="success" message="E-posta adresiniz doğrulandı. Şimdi giriş yapabilirsiniz." />
      )}
      {formError && <FormAlert type="error" message={formError} />}

      {unverified && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
          <p className="text-slate-600">Doğrulama e-postası ulaşmadı mı?</p>
          <button
            type="button"
            onClick={resendVerification}
            disabled={resendState.loading}
            className="mt-2 inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline disabled:opacity-60"
          >
            {resendState.loading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <MailCheck className="size-4" aria-hidden="true" />
            )}
            Doğrulama e-postasını tekrar gönder
          </button>
          {resendState.message && (
            <p role="status" className="mt-2 text-slate-600">
              {resendState.message}
            </p>
          )}
        </div>
      )}

      <FormField
        id="email"
        label="E-posta"
        type="email"
        autoComplete="email"
        placeholder="ornek@eposta.com"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
        disabled={loading}
        required
      />
      <FormField
        id="password"
        label="Şifre"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
        disabled={loading}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-5" aria-hidden="true" />
        )}
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
