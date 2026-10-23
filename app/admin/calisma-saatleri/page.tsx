import type { Metadata } from "next";
import ClosedDaysManager from "@/components/admin/ClosedDaysManager";
import WorkingHoursEditor from "@/components/admin/WorkingHoursEditor";
import { AdminPageHeader } from "@/components/admin/ui";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requireAdminPage } from "@/lib/auth/guards";
import { getClosedDays, getWorkingHours } from "@/lib/data/appointments";
import { todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Çalışma Saatleri" };
export const dynamic = "force-dynamic";

export default async function WorkingHoursPage() {
  await requireAdminPage();
  const [days, closedDays] = await Promise.all([getWorkingHours(), getClosedDays(todayKey())]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Çalışma Saatleri"
        description={`Hangi gün ve saatlerde randevu alınabileceğini belirleyin. Her slot ${SLOT_DURATION_MINUTES} dakikalık bir seanstır; dolu slotlar, kapalı günler ve Google Takvim'deki etkinlikler hastalara otomatik olarak kapalı görünür.`}
      />
      <div className="space-y-6">
        <ClosedDaysManager initial={closedDays} />
        <WorkingHoursEditor initialDays={days} />
      </div>
    </>
  );
}
