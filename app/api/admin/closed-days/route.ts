import { NextResponse } from "next/server";
import { ACTIVE_STATUSES } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { keyToDate, todayKey } from "@/lib/dates";
import { isDuplicateKeyError, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { closedDaySchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";
import ClosedDay from "@/models/ClosedDay";

export const runtime = "nodejs";

/** POST /api/admin/closed-days { date, reason } → tarihi randevuya kapatır */
export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = closedDaySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz tarih.", 400);
  const { date, reason } = parsed.data;
  if (date < todayKey()) return jsonError("Geçmiş bir tarih kapatılamaz.", 400);

  try {
    await connectDB();
    await ClosedDay.create({ date: keyToDate(date), reason });
    // Mevcut randevular otomatik iptal edilmez; fizyoterapist bilgilendirilir
    const existing = await Appointment.countDocuments({ date: keyToDate(date), status: { $in: [...ACTIVE_STATUSES] } });
    return NextResponse.json(
      {
        message: existing
          ? `Gün kapatıldı. Bu tarihte ${existing} aktif randevu var; lütfen bu randevuları erteleyin veya iptal edin.`
          : "Gün randevuya kapatıldı.",
        existingAppointments: existing,
      },
      { status: 201 },
    );
  } catch (err) {
    if (isDuplicateKeyError(err)) return jsonError("Bu tarih zaten kapalı.", 409);
    console.error("[admin:closed-days:create]", err);
    return jsonError("Gün kapatılırken bir hata oluştu.", 500);
  }
}
