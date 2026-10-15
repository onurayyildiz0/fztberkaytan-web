import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { getWorkingHours } from "@/lib/data/appointments";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { workingHoursSchema } from "@/lib/validations/appointments";
import WorkingHours from "@/models/WorkingHours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/working-hours → 7 günün çalışma saatleri */
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json({ days: await getWorkingHours() });
}

/** PUT /api/admin/working-hours  { days: [...7 gün] } → tüm haftayı kaydeder */
export async function PUT(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = workingHoursSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz çalışma saatleri.", 400);
  }

  try {
    await connectDB();
    await WorkingHours.bulkWrite(
      parsed.data.days.map((day) => ({
        updateOne: {
          filter: { dayOfWeek: day.dayOfWeek },
          update: {
            $set: {
              isDayOff: day.isDayOff,
              slots: [...new Set(day.slots)].sort(),
            },
          },
          upsert: true,
        },
      })),
    );

    // Not: Mevcut randevular etkilenmez; kapatılan saatlerdeki randevular panelden yönetilmelidir.
    return NextResponse.json({ message: "Çalışma saatleri kaydedildi.", days: await getWorkingHours() });
  } catch (err) {
    console.error("[admin:working-hours]", err);
    return jsonError("Çalışma saatleri kaydedilirken bir hata oluştu.", 500);
  }
}
