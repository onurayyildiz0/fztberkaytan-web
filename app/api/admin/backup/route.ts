import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { todayKey } from "@/lib/dates";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/backup → klinik verilerinin JSON yedeği (yalnızca admin).
 * Şifre hash'leri ve geçici güvenlik kayıtları (doğrulama token'ları, istek sayaçları) dahil edilmez.
 */
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  await connectDB();
  const [patients, appointments, accounts] = await Promise.all([
    Patient.find().lean(),
    Appointment.find().lean(),
    User.find().select("-password").lean(),
  ]);

  const backup = {
    format: "fztberkaytan-yedek",
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      patients: patients.length,
      appointments: appointments.length,
      accounts: accounts.length,
    },
    data: { patients, appointments, accounts },
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="klinik-yedek-${todayKey()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
