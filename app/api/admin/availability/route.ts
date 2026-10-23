import { NextResponse, type NextRequest } from "next/server";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAvailableSlots } from "@/lib/data/appointments";
import { isDateKey, slotLabel } from "@/lib/dates";
import { isObjectId, jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/availability?date=YYYY-MM-DD[&exclude=<randevuId>] → admin için boş slotlar (60 gün sınırı yok) */
export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const date = request.nextUrl.searchParams.get("date");
  const exclude = request.nextUrl.searchParams.get("exclude");
  if (!isDateKey(date)) return jsonError("Geçerli bir tarih gönderin (YYYY-MM-DD).", 400);

  const slots = await getAvailableSlots(date, {
    admin: true,
    excludeAppointmentId: exclude && isObjectId(exclude) ? exclude : undefined,
  });
  return NextResponse.json({
    date,
    slots: slots.map((start) => ({ start, label: slotLabel(start, SLOT_DURATION_MINUTES) })),
  });
}
