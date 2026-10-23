import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { isGoogleCalendarConfigured, testGoogleCalendar } from "@/lib/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/google-calendar → Google Takvim bağlantı durumu */
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ configured: false, ok: false, message: "Google Takvim ayarları yapılmamış." });
  }
  const result = await testGoogleCalendar();
  return NextResponse.json({ configured: true, ...result });
}
