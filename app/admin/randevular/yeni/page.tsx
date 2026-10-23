import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewAppointmentForm, { type PickedPatient } from "@/components/admin/NewAppointmentForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card } from "@/components/panel/ui";
import { requireAdminPage } from "@/lib/auth/guards";
import { getPatient } from "@/lib/data/patients";
import { isDateKey, isTime, todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Yeni Randevu" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function NewAppointmentPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;

  // Hasta kartından (?hasta=) veya takvimden (?tarih=&saat=) gelinebilir
  const patientDoc = first(sp.hasta) ? await getPatient(first(sp.hasta)!) : null;
  const initialPatient: PickedPatient | null = patientDoc
    ? {
        id: patientDoc._id.toString(),
        name: patientDoc.name,
        phone: patientDoc.phone ?? null,
        email: patientDoc.email ?? null,
        hasAccount: !!patientDoc.userId,
      }
    : null;
  const tarih = first(sp.tarih);
  const saat = first(sp.saat);
  const initialDate = isDateKey(tarih) && tarih >= todayKey() ? tarih : undefined;
  const initialTime = isTime(saat) ? saat : undefined;

  return (
    <>
      <Link href="/admin/takvim" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700">
        <ArrowLeft className="size-4" aria-hidden="true" /> Takvim
      </Link>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Yeni Randevu"
        description="Telefonla ya da klinikte alınan randevuları kaydedin. Fizyoterapistin oluşturduğu randevular doğrudan onaylı olarak eklenir."
      />
      <Card className="max-w-3xl p-6">
        <NewAppointmentForm initialPatient={initialPatient} initialDate={initialDate} initialTime={initialTime} />
      </Card>
    </>
  );
}
