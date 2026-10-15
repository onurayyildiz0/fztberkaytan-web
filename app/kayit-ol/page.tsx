import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hasta Kaydı"
      subtitle="Online randevu almak ve randevularınızı takip etmek için ücretsiz hesap oluşturun."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link href="/giris-yap" className="font-semibold text-teal-700 hover:underline">
            Giriş Yapın
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
