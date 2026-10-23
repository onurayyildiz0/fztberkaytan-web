import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Şifremi Unuttum"
      subtitle="Hesabınıza kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."
      footer={
        <>
          Şifrenizi hatırladınız mı?{" "}
          <Link href="/giris-yap" className="font-semibold text-teal-700 hover:underline">
            Giriş Yapın
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
