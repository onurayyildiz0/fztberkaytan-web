import { NextResponse, after } from "next/server";
import type { Types } from "mongoose";
import { ADMIN_TRANSITIONS, STATUS_LABELS } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { dateToKey } from "@/lib/dates";
import { sendStatusUpdateEmail } from "@/lib/emails";
import { isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { updateStatusSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string } | null;

/** PATCH /api/admin/appointments/:id  { status } → randevu durumunu günceller */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  const parsed = updateStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Geçersiz durum.", 400);
  const { status } = parsed.data;

  try {
    await connectDB();
    const current = await Appointment.findById(id).select("status").lean();
    if (!current) return jsonError("Randevu bulunamadı.", 404);

    if (!ADMIN_TRANSITIONS[current.status].includes(status)) {
      return jsonError(
        `"${STATUS_LABELS[current.status]}" durumundaki randevu "${STATUS_LABELS[status]}" yapılamaz.`,
        409,
      );
    }

    // Durum okunduktan sonra başka bir işlem değiştirdiyse güncelleme yapılmaz
    const updated = await Appointment.findOneAndUpdate(
      { _id: id, status: current.status },
      { $set: { status } },
      { new: true },
    )
      .populate<{ patientId: PopulatedPatient }>("patientId", "name email")
      .lean();

    if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);

    const patient = updated.patientId;
    if (patient) {
      after(() =>
        sendStatusUpdateEmail(
          { serviceName: updated.serviceName, date: dateToKey(updated.date), timeSlot: updated.timeSlot },
          { name: patient.name, email: patient.email ?? null },
          status,
        ),
      );
    }

    return NextResponse.json({ message: `Randevu "${STATUS_LABELS[status]}" olarak güncellendi.`, status });
  } catch (err) {
    console.error("[admin:appointments:update]", err);
    return jsonError("Randevu güncellenirken bir hata oluştu.", 500);
  }
}
