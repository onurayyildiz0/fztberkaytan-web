import type { Metadata } from "next";
import WorkingHoursEditor from "@/components/admin/WorkingHoursEditor";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth/guards";
import { getWorkingHours } from "@/lib/data/appointments";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";

export const metadata: Metadata = { title: "Çalışma Saatleri" };
export const dynamic = "force-dynamic";

export default async function WorkingHoursPage() {
  await requireAdminPage();
  const days = await getWorkingHours();

  return (
    <>
      <AdminPageHeader
        eyebrow="Randevular"
        title="Çalışma Saatleri"
        description={`Hangi gün ve saatlerde randevu alınabileceğini belirleyin. Her slot ${SLOT_DURATION_MINUTES} dakikalık bir seanstır; dolu slotlar hastalara otomatik olarak kapalı görünür.`}
      />
      <WorkingHoursEditor initialDays={days} />
    </>
  );
}
