import { NextResponse, after } from "next/server";
import type { Types } from "mongoose";
import { ADMIN_TRANSITIONS, STATUS_LABELS } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { syncAppointmentToGoogle } from "@/lib/data/appointments";
import { dateToKey } from "@/lib/dates";
import { sendStatusUpdateEmail } from "@/lib/emails";
import { isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { serviceLabel } from "@/lib/services";
import { updateAppointmentSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string } | null;

/** PATCH /api/admin/appointments/:id  { status?, adminNotes? } → durum ve/veya admin notu günceller */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  const parsed = updateAppointmentSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz istek.", 400);
  const { status, adminNotes } = parsed.data;

  try {
    await connectDB();
    const current = await Appointment.findById(id).select("status").lean();
    if (!current) return jsonError("Randevu bulunamadı.", 404);

    const set: Record<string, unknown> = {};
    if (adminNotes !== undefined) set.adminNotes = adminNotes;

    const statusChanged = status !== undefined && status !== current.status;
    if (statusChanged) {
      if (!ADMIN_TRANSITIONS[current.status].includes(status)) {
        return jsonError(
          `"${STATUS_LABELS[current.status]}" durumundaki randevu "${STATUS_LABELS[status]}" yapılamaz.`,
          409,
        );
      }
      set.status = status;
      if (status === "cancelled") set.cancelledBy = "admin";
      // Sonlanan randevuda bekleyen erteleme önerisi geçersizdir
      if (status !== "approved") Object.assign(set, { proposedDate: null, proposedTimeSlot: null, proposedAt: null });
    }

    // Durum okunduktan sonra başka bir işlem değiştirdiyse güncelleme yapılmaz
    const updated = await Appointment.findOneAndUpdate({ _id: id, status: current.status }, { $set: set }, { new: true })
      .populate<{ patientId: PopulatedPatient }>("patientId", "name email")
      .lean();
    if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);

    if (statusChanged && status) {
      const patient = updated.patientId;
      after(async () => {
        await syncAppointmentToGoogle(id);
        if (patient) {
          await sendStatusUpdateEmail(
            { serviceName: serviceLabel(updated.serviceName, updated.serviceOption), date: dateToKey(updated.date), timeSlot: updated.timeSlot },
            { name: patient.name, email: patient.email ?? null },
            status,
          );
        }
      });
    }

    return NextResponse.json({
      message: statusChanged && status ? `Randevu "${STATUS_LABELS[status]}" olarak güncellendi.` : "Kaydedildi.",
      status: updated.status,
    });
  } catch (err) {
    console.error("[admin:appointments:update]", err);
    return jsonError("Randevu güncellenirken bir hata oluştu.", 500);
  }
}
