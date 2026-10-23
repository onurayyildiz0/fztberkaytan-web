import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { isPasswordResetTokenValid } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirle",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = (Array.isArray(sp.token) ? sp.token[0] : sp.token) ?? "";
  const valid = await isPasswordResetTokenValid(token);

  return (
    <AuthShell
      title={valid ? "Yeni Şifre Belirle" : "Bağlantı geçersiz"}
      subtitle={
        valid
          ? "Hesabınız için yeni bir şifre belirleyin."
          : "Şifre sıfırlama bağlantısı geçersiz, daha önce kullanılmış veya süresi dolmuş olabilir."
      }
      footer={
        <Link href="/giris-yap" className="font-semibold text-teal-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      }
    >
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <CircleAlert className="size-8" aria-hidden="true" />
          </span>
          <Link
            href="/sifremi-unuttum"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Yeni Bağlantı İste
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
