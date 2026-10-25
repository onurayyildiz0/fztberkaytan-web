import { NextResponse, type NextRequest } from "next/server";
import { requirePatientApi } from "@/lib/auth/guards";
import { getAvailability, getDaySlots, makeTimeSlot } from "@/lib/data/appointments";
import { addDays, isDateKey, monthRange } from "@/lib/dates";
import { jsonError } from "@/lib/http";
import { isServiceName, isValidServiceOption, serviceDurationMinutes } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/appointments/availability?service=..&option=..&date=YYYY-MM-DD → o günün saatleri (dolu olanlar available:false)
 * GET /api/appointments/availability?service=..&option=..&month=YYYY-MM  → ayın müsait günleri
 * Süre seçilen hizmete göre hesaplanır.
 */
export async function GET(request: NextRequest) {
  const { error } = await requirePatientApi();
  if (error) return error;

  const sp = request.nextUrl.searchParams;
  const service = sp.get("service") ?? "";
  const option = sp.get("option") || null;
  if (!isServiceName(service) || !isValidServiceOption(service, option)) {
    return jsonError("Geçerli bir hizmet seçin.", 400);
  }
  const duration = serviceDurationMinutes(service, option);

  const month = sp.get("month");
  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    const range = monthRange(`${month}-01`);
    const availability = await getAvailability(range.start, addDays(range.end, -1), duration);
    return NextResponse.json({ month, dates: [...availability.keys()].sort() });
  }

  const date = sp.get("date");
  if (!isDateKey(date)) return jsonError("Geçerli bir tarih gönderin (YYYY-MM-DD).", 400);
  const slots = (await getDaySlots(date, date, duration)).get(date) ?? [];
  return NextResponse.json({
    date,
    durationMinutes: duration,
    slots: slots.map((s) => ({ start: s.start, label: makeTimeSlot(s.start, duration), available: s.available })),
  });
}
