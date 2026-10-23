import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, CalendarX2, History } from "lucide-react";
import PatientAppointmentItem from "@/components/patient/PatientAppointmentItem";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/panel/ui";
import { requirePatientWithCardPage } from "@/lib/auth/guards";
import { findAppointments } from "@/lib/data/appointments";
import { PATIENT_CANCEL_MIN_HOURS } from "@/lib/appointments";
import { todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Randevularım" };
export const dynamic = "force-dynamic";

export default async function MyAppointmentsPage() {
  const { patient } = await requirePatientWithCardPage();
  const patientId = patient._id.toString();
  const today = todayKey();

  const [upcoming, past] = await Promise.all([
    findAppointments({ patientId, from: today, sort: 1 }),
    findAppointments({ patientId, to: today, sort: -1 }),
  ]);

  return (
    <>
      <PageHeader
        title="Randevularım"
        description={`Randevunuza ${PATIENT_CANCEL_MIN_HOURS} saatten fazla varsa buradan iptal edebilirsiniz. Daha yakın randevular ve tarih değişikliği için lütfen bizi arayın.`}
        actions={
          <Link
            href="/hasta-paneli/randevu-al"
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <CalendarPlus className="size-4" aria-hidden="true" /> Yeni Randevu
          </Link>
        }
      />

      <Card>
        <CardHeader title={`Gelecek Randevular (${upcoming.length})`} />
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarX2} title="Gelecek randevunuz yok" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((a) => (
              <PatientAppointmentItem key={a.id} appointment={a} />
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title={`Geçmiş Randevular (${past.length})`} />
        {past.length === 0 ? (
          <EmptyState icon={History} title="Geçmiş randevunuz yok" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {past.map((a) => (
              <PatientAppointmentItem key={a.id} appointment={a} allowCancel={false} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
