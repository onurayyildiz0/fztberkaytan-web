import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, CircleCheckBig, LogIn } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmailToken } from "@/lib/verification";

export const metadata: Metadata = {
  title: "E-posta Doğrulama",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const result = token ? await verifyEmailToken(token) : "invalid";
  const ok = result === "verified";

  return (
    <AuthShell
      title={ok ? "E-postanız doğrulandı" : "Bağlantı geçersiz"}
      subtitle={
        ok
          ? "Hesabınız etkinleştirildi. Artık giriş yaparak online randevu alabilirsiniz."
          : "Doğrulama bağlantısı geçersiz, daha önce kullanılmış veya süresi dolmuş olabilir."
      }
      footer={
        <Link href="/" className="font-semibold text-teal-700 hover:underline">
          Anasayfaya dön
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span
          className={`flex size-14 items-center justify-center rounded-full ${
            ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {ok ? (
            <CircleCheckBig className="size-8" aria-hidden="true" />
          ) : (
            <CircleAlert className="size-8" aria-hidden="true" />
          )}
        </span>
        {!ok && (
          <p className="mt-4 text-sm text-slate-600">
            Giriş sayfasından e-posta ve şifrenizle giriş yapmayı denediğinizde yeni bir doğrulama bağlantısı
            isteyebilirsiniz.
          </p>
        )}
        <Link
          href={ok ? "/giris-yap?dogrulama=basarili" : "/giris-yap"}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
        >
          <LogIn className="size-5" aria-hidden="true" />
          Giriş Yap
        </Link>
      </div>
    </AuthShell>
  );
}
