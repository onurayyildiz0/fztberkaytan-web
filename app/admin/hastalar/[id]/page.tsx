import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus, Mail, NotebookPen, Phone } from "lucide-react";
import AppointmentList from "@/components/admin/AppointmentList";
import EditPatientCard from "@/components/admin/EditPatientCard";
import SourceBadge from "@/components/admin/SourceBadge";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card, CardHeader } from "@/components/panel/ui";
import { APPOINTMENT_STATUSES, STATUS_LABELS } from "@/lib/appointments";
import { requireAdminPage } from "@/lib/auth/guards";
import { findAdminAppointments } from "@/lib/data/appointments";
import { getPatient } from "@/lib/data/patients";
import { formatDateLong, formatTimestamp, todayKey } from "@/lib/dates";
import { GENDER_LABELS } from "@/lib/validations/patients";

export const metadata: Metadata = { title: "Hasta Kartı" };
export const dynamic = "force-dynamic";

function ageOf(birthDate: string): number {
  const today = todayKey();
  const age = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? age - 1 : age;
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const appointments = await findAdminAppointments({ patientId: id, sort: -1 });
  const summary = APPOINTMENT_STATUSES.map((s) => ({
    status: s,
    count: appointments.filter((a) => a.status === s).length,
  })).filter((s) => s.count > 0);

  return (
    <>
      <Link
        href="/admin/hastalar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Hasta Listesi
      </Link>
      <AdminPageHeader
        eyebrow="Hasta Kartı"
        title={patient.name}
        description={`Eklenme: ${formatTimestamp(patient.createdAt.toISOString())}`}
        actions={
          <>
            <SourceBadge source={patient.source} hasAccount={!!patient.userId} />
            <EditPatientCard
              patientId={id}
              hasAccount={!!patient.userId}
              initial={{
                name: patient.name,
                tcNo: patient.tcNo ?? "",
                birthDate: patient.birthDate ?? "",
                gender: patient.gender ?? "",
                phone: patient.phone ?? "",
                email: patient.email ?? "",
                emergencyContactName: patient.emergencyContactName ?? "",
                emergencyContactPhone: patient.emergencyContactPhone ?? "",
                referringPhysician: patient.referringPhysician ?? "",
                complaint: patient.complaint ?? "",
                findings: patient.findings ?? "",
                notes: patient.notes ?? "",
              }}
            />
            <Link
              href={`/admin/randevular/yeni?hasta=${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <CalendarPlus className="size-4" aria-hidden="true" /> Randevu Oluştur
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900">İletişim</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                {patient.phone ? (
                  <a href={`tel:${patient.phone.replace(/\s/g, "")}`} className="text-teal-700 hover:underline">
                    {patient.phone}
                  </a>
                ) : (
                  <span className="text-slate-500">Belirtilmemiş</span>
                )}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                {patient.email ? (
                  <a href={`mailto:${patient.email}`} className="break-all text-teal-700 hover:underline">
                    {patient.email}
                  </a>
                ) : (
                  <span className="text-slate-500">Belirtilmemiş</span>
                )}
              </li>
              <li className="flex items-center gap-3">
                <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{appointments.length} randevu</span>
              </li>
            </ul>
            {summary.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-sm">
                {summary.map((s) => (
                  <div key={s.status} className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-500">{STATUS_LABELS[s.status]}</dt>
                    <dd className="font-bold text-slate-900">{s.count}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <NotebookPen className="size-4 text-slate-400" aria-hidden="true" /> Kimlik ve Klinik Bilgiler
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["T.C. Kimlik No", patient.tcNo],
                ["Doğum Tarihi", patient.birthDate ? `${formatDateLong(patient.birthDate)} (${ageOf(patient.birthDate)} yaş)` : undefined],
                ["Cinsiyet", patient.gender ? GENDER_LABELS[patient.gender] : undefined],
                ["Acil Durum Kişisi", [patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(" · ") || undefined],
                ["Yönlendiren Hekim", patient.referringPhysician],
                ["Şikâyet", patient.complaint],
                ["Bulgular", patient.findings],
                ["Notlar", patient.notes],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className={`mt-0.5 whitespace-pre-wrap ${value ? "text-slate-900" : "text-slate-400"}`}>{value || "Belirtilmemiş"}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Randevu Geçmişi" />
          <AppointmentList appointments={appointments} showActions hidePatient emptyTitle="Bu hastanın randevusu yok" />
        </Card>
      </div>
    </>
  );
}
