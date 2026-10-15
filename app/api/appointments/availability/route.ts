import { NextResponse, type NextRequest } from "next/server";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requirePatientApi } from "@/lib/auth/guards";
import { getAvailableSlots } from "@/lib/data/appointments";
import { isDateKey, slotLabel } from "@/lib/dates";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/appointments/availability?date=YYYY-MM-DD → seçilen gün için boş slotlar */
export async function GET(request: NextRequest) {
  const { error } = await requirePatientApi();
  if (error) return error;

  const date = request.nextUrl.searchParams.get("date");
  if (!isDateKey(date)) return jsonError("Geçerli bir tarih gönderin (YYYY-MM-DD).", 400);

  const slots = await getAvailableSlots(date);
  return NextResponse.json({
    date,
    slots: slots.map((start) => ({ start, label: slotLabel(start, SLOT_DURATION_MINUTES) })),
  });
}
