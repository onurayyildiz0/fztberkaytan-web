import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewPatientForm from "@/components/admin/NewPatientForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card } from "@/components/panel/ui";
import { requireAdminPage } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Yeni Hasta" };

export default async function NewPatientPage() {
  await requireAdminPage();
  return (
    <>
      <Link
        href="/admin/hastalar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Hasta Listesi
      </Link>
      <AdminPageHeader
        eyebrow="Hastalar"
        title="Yeni Hasta"
        description="Telefonla ulaşan veya randevusuz gelen hastalar için hasta kartı oluşturun. Hastanın siteye üye olması gerekmez."
      />
      <Card className="max-w-2xl p-6">
        <NewPatientForm />
      </Card>
    </>
  );
}
