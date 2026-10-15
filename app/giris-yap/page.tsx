import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Giriş Yap"
      subtitle="Randevularınızı görüntülemek ve yeni randevu almak için hesabınıza giriş yapın."
      footer={
        <>
          Hesabınız yok mu?{" "}
          <Link href="/kayit-ol" className="font-semibold text-teal-700 hover:underline">
            Kayıt Olun
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
