import { NextResponse, after } from "next/server";
import type { Types } from "mongoose";
import { RESCHEDULABLE_STATUSES, SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAvailableSlots, isSlotTaken, syncAppointmentToGoogle } from "@/lib/data/appointments";
import { dateToKey, keyToDate, slotLabel, todayKey } from "@/lib/dates";
import { sendRescheduledEmail } from "@/lib/emails";
import { isDuplicateKeyError, isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { rescheduleSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string; userId?: Types.ObjectId } | null;

/** POST /api/admin/appointments/:id/reschedule { date, time } → randevunun tarih/saatini değiştirir */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  const parsed = rescheduleSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz istek.", 400);
  const { date, time, allowOutsideHours, notifyPatient } = parsed.data;

  if (date < todayKey()) return jsonError("Geçmiş bir tarihe ertelenemez.", 400);

  try {
    await connectDB();
    const current = await Appointment.findById(id).lean();
    if (!current) return jsonError("Randevu bulunamadı.", 404);
    if (!RESCHEDULABLE_STATUSES.includes(current.status)) {
      return jsonError("Yalnızca bekleyen veya onaylı randevular ertelenebilir.", 409);
    }

    const timeSlot = slotLabel(time, SLOT_DURATION_MINUTES);
    const previous = { date: dateToKey(current.date), timeSlot: current.timeSlot };
    if (previous.date === date && previous.timeSlot === timeSlot) {
      return jsonError("Yeni tarih ve saat mevcut randevuyla aynı.", 400);
    }

    if (allowOutsideHours) {
      if (await isSlotTaken(date, timeSlot, id)) return jsonError("Bu saatte başka bir randevu var.", 409);
    } else {
      const available = await getAvailableSlots(date, { admin: true, excludeAppointmentId: id });
      if (!available.includes(time)) {
        return jsonError(
          "Bu saat müsait değil. Yine de taşımak için 'Çalışma saati dışında' seçeneğini kullanın.",
          409,
        );
      }
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: id, status: current.status },
      // Yeni tarih için hatırlatma yeniden gönderilsin
      { $set: { date: keyToDate(date), timeSlot, reminderSentAt: null } },
      { new: true },
    )
      .populate<{ patientId: PopulatedPatient }>("patientId", "name email userId")
      .lean();
    if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);

    const patient = updated.patientId;
    after(async () => {
      await syncAppointmentToGoogle(id);
      if (notifyPatient && patient) {
        await sendRescheduledEmail(
          previous,
          { serviceName: updated.serviceName, date, timeSlot },
          { name: patient.name, email: patient.email ?? null },
          !!patient.userId,
        );
      }
    });

    return NextResponse.json({ message: "Randevu ertelendi.", date, timeSlot });
  } catch (err) {
    if (isDuplicateKeyError(err)) return jsonError("Bu saatte başka bir randevu var.", 409);
    console.error("[admin:appointments:reschedule]", err);
    return jsonError("Randevu ertelenirken bir hata oluştu.", 500);
  }
}
