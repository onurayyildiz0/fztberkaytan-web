import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAvailableStarts, makeTimeSlot } from "@/lib/data/appointments";
import { isDateKey } from "@/lib/dates";
import { isObjectId, jsonError } from "@/lib/http";
import { isServiceName, isValidServiceOption, serviceDurationMinutes } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability?date=YYYY-MM-DD&service=..&option=..[&duration=dk][&exclude=<randevuId>]
 * Admin için boş başlangıç saatleri (60 gün sınırı yok). Süre hizmetten veya doğrudan "duration"dan alınır.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const sp = request.nextUrl.searchParams;
  const date = sp.get("date");
  if (!isDateKey(date)) return jsonError("Geçerli bir tarih gönderin (YYYY-MM-DD).", 400);

  const service = sp.get("service") ?? "";
  const option = sp.get("option") || null;
  const durationParam = Number(sp.get("duration"));
  let duration: number;
  if (Number.isInteger(durationParam) && durationParam >= 5 && durationParam <= 480) duration = durationParam;
  else if (isServiceName(service) && isValidServiceOption(service, option)) duration = serviceDurationMinutes(service, option);
  else return jsonError("Hizmet veya süre gönderin.", 400);

  const exclude = sp.get("exclude");
  const starts = await getAvailableStarts(date, duration, {
    admin: true,
    excludeAppointmentId: exclude && isObjectId(exclude) ? exclude : undefined,
  });
  return NextResponse.json({
    date,
    durationMinutes: duration,
    slots: starts.map((start) => ({ start, label: makeTimeSlot(start, duration) })),
  });
}
