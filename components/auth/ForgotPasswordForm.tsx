"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck, Send } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "İstek gönderilemedi.");
        return;
      }
      setSent(data.message ?? "Bağlantı gönderildi.");
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm text-slate-600">{sent}</p>
        <p className="mt-2 text-xs text-slate-500">Bağlantı 60 dakika geçerlidir.</p>
        <Link href="/giris-yap" className="mt-6 text-sm font-semibold text-teal-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <FormAlert type="error" message={error} />}
      <FormField
        id="email"
        label="E-posta"
        type="email"
        autoComplete="email"
        placeholder="ornek@eposta.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-70"
      >
        {loading ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
        Sıfırlama Bağlantısı Gönder
      </button>
    </form>
  );
}
