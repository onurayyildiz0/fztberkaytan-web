import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarPlus, CalendarX2, Tags, type LucideIcon } from "lucide-react";
import PatientAppointmentItem from "@/components/patient/PatientAppointmentItem";
import { Card, CardHeader, EmptyState } from "@/components/panel/ui";
import { requirePatientWithCardPage } from "@/lib/auth/guards";
import { findAppointments } from "@/lib/data/appointments";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS: { href: string; title: string; description: string; icon: LucideIcon; primary?: boolean }[] = [
  {
    href: "/hasta-paneli/randevu-al",
    title: "Yeni Randevu Al",
    description: "Hizmet, tarih ve saat seçerek randevu talebi oluşturun.",
    icon: CalendarPlus,
    primary: true,
  },
  {
    href: "/hasta-paneli/randevularim",
    title: "Randevularım",
    description: "Geçmiş ve gelecek randevularınızı görüntüleyin.",
    icon: CalendarCheck,
  },
  {
    href: "/hasta-paneli/hizmetler",
    title: "Hizmetler",
    description: "Sunulan hizmetleri ve seans sürelerini inceleyin.",
    icon: Tags,
  },
];

export default async function PatientHomePage() {
  const { session, patient } = await requirePatientWithCardPage();
  const today = todayKey();
  const appointments = await findAppointments({ patientId: patient._id.toString(), from: today });
  const upcoming = appointments.filter((a) => a.status === "pending" || a.status === "approved").slice(0, 5);

  const firstName = session.user.name?.split(" ")[0] ?? "";

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-medium text-teal-100">Hasta Paneli</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Hoş geldiniz, {firstName}!</h1>
        <p className="mt-2 max-w-xl text-teal-50">
          Buradan yeni randevu talebi oluşturabilir, randevularınızın durumunu takip edebilirsiniz.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, title, description, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col rounded-2xl p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
              primary ? "bg-teal-50 ring-teal-200" : "bg-white ring-slate-200"
            }`}
          >
            <span
              className={`flex size-11 items-center justify-center rounded-xl ${
                primary ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-4 flex items-center gap-1.5 font-semibold text-slate-900">
              {title}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="mt-1 text-sm text-slate-600">{description}</span>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Yaklaşan Randevularım"
          action={
            <Link href="/hasta-paneli/randevularim" className="text-sm font-semibold text-teal-700 hover:underline">
              Tümü
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="Yaklaşan randevunuz yok"
            description="Hemen yeni bir randevu talebi oluşturabilirsiniz."
            action={
              <Link
                href="/hasta-paneli/randevu-al"
                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <CalendarPlus className="size-4" aria-hidden="true" /> Randevu Al
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((a) => (
              <PatientAppointmentItem key={a.id} appointment={a} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
