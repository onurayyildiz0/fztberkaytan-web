import type { Metadata } from "next";
import BookingWizard from "@/components/patient/BookingWizard";
import { PageHeader } from "@/components/panel/ui";
import { BOOKING_WINDOW_DAYS } from "@/lib/appointments";
import { requirePatientPage } from "@/lib/auth/guards";
import { getClosedDays, getWorkingHours } from "@/lib/data/appointments";
import { addDays, todayKey } from "@/lib/dates";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Randevu Al" };
export const dynamic = "force-dynamic";

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePatientPage();
  const sp = await searchParams;
  const slug = Array.isArray(sp.hizmet) ? sp.hizmet[0] : sp.hizmet;
  const initialService = SERVICES.find((s) => s.slug === slug)?.name ?? null;

  const today = todayKey();
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS);
  const [workingHours, closedDays] = await Promise.all([getWorkingHours(), getClosedDays(today, maxDate)]);
  const openDays = workingHours.filter((d) => !d.isDayOff && d.slots.length > 0).map((d) => d.dayOfWeek);

  return (
    <>
      <PageHeader title="Randevu Al" description="Birkaç adımda randevu talebinizi oluşturun." />
      <BookingWizard
        initialService={initialService}
        minDate={today}
        maxDate={maxDate}
        openDays={openDays}
        closedDates={closedDays.map((d) => d.date)}
      />
    </>
  );
}
