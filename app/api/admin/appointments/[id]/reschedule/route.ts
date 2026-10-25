import { NextResponse, after } from "next/server";
import type { Types } from "mongoose";
import { RESCHEDULABLE_STATUSES, SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAvailableStarts, isSlotTaken, makeTimeSlot, syncAppointmentToGoogle } from "@/lib/data/appointments";
import { dateToKey, keyToDate, todayKey } from "@/lib/dates";
import { sendRescheduleProposalEmail, sendRescheduledEmail } from "@/lib/emails";
import { isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { serviceLabel } from "@/lib/services";
import { rescheduleSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string; userId?: Types.ObjectId } | null;

/**
 * POST /api/admin/appointments/:id/reschedule { date, time, mode }
 * - mode "propose" (varsayılan): yeni tarih hastaya önerilir; hasta panelden kabul edince kesinleşir.
 *   Önerilen saat bu sırada başkasına açılmaz.
 * - mode "confirmed": hasta yeni saati (ör. telefonda) kabul etti; randevu doğrudan taşınır.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  const parsed = rescheduleSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz istek.", 400);
  const { date, time, mode, allowOutsideHours, notifyPatient } = parsed.data;
  if (date < todayKey()) return jsonError("Geçmiş bir tarihe ertelenemez.", 400);

  try {
    await connectDB();
    const current = await Appointment.findById(id)
      .populate<{ patientId: PopulatedPatient }>("patientId", "name email userId")
      .lean();
    if (!current) return jsonError("Randevu bulunamadı.", 404);
    if (!RESCHEDULABLE_STATUSES.includes(current.status)) {
      return jsonError("Yalnızca bekleyen veya onaylı randevular ertelenebilir.", 409);
    }
    const patient = current.patientId;
    if (mode === "propose" && !patient?.userId) {
      return jsonError(
        "Bu hastanın online hesabı yok; öneriyi panelden göremez. Yeni saati telefonla teyit edip 'Hasta kabul etti' seçeneğiyle kaydedin.",
        400,
      );
    }

    const duration = current.durationMinutes ?? SLOT_DURATION_MINUTES;
    const timeSlot = makeTimeSlot(time, duration);
    const previous = { date: dateToKey(current.date), timeSlot: current.timeSlot };
    if (previous.date === date && previous.timeSlot === timeSlot) {
      return jsonError("Yeni tarih ve saat mevcut randevuyla aynı.", 400);
    }

    if (allowOutsideHours) {
      if (await isSlotTaken(date, timeSlot, id)) return jsonError("Bu saat başka bir randevuyla çakışıyor.", 409);
    } else {
      const available = await getAvailableStarts(date, duration, { admin: true, excludeAppointmentId: id });
      if (!available.includes(time)) {
        return jsonError("Bu saat müsait değil. Yine de kullanmak için 'Müsaitlik dışında' seçeneğini işaretleyin.", 409);
      }
    }

    const label = serviceLabel(current.serviceName, current.serviceOption);

    if (mode === "propose") {
      const updated = await Appointment.findOneAndUpdate(
        { _id: id, status: current.status },
        { $set: { proposedDate: keyToDate(date), proposedTimeSlot: timeSlot, proposedAt: new Date() } },
        { new: true },
      ).lean();
      if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);
      if (notifyPatient && patient) {
        after(() =>
          sendRescheduleProposalEmail(
            previous,
            { serviceName: label, date, timeSlot },
            { name: patient.name, email: patient.email ?? null },
          ),
        );
      }
      return NextResponse.json({ message: "Yeni tarih hastaya önerildi; hasta kabul edince kesinleşecek.", mode });
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: id, status: current.status },
      // Yeni tarih için hatırlatma yeniden gönderilsin; varsa bekleyen öneri kaldırılır
      {
        $set: {
          date: keyToDate(date),
          timeSlot,
          reminderSentAt: null,
          proposedDate: null,
          proposedTimeSlot: null,
          proposedAt: null,
        },
      },
      { new: true },
    ).lean();
    if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);

    after(async () => {
      await syncAppointmentToGoogle(id);
      if (notifyPatient && patient) {
        await sendRescheduledEmail(
          previous,
          { serviceName: label, date, timeSlot },
          { name: patient.name, email: patient.email ?? null },
          !!patient.userId,
        );
      }
    });
    return NextResponse.json({ message: "Randevu yeni tarihe taşındı.", mode });
  } catch (err) {
    console.error("[admin:appointments:reschedule]", err);
    return jsonError("Randevu ertelenirken bir hata oluştu.", 500);
  }
}

/** DELETE /api/admin/appointments/:id/reschedule → hastaya yapılan erteleme önerisini geri çeker */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  await connectDB();
  const result = await Appointment.updateOne(
    { _id: id, proposedDate: { $ne: null } },
    { $set: { proposedDate: null, proposedTimeSlot: null, proposedAt: null } },
  );
  if (result.modifiedCount === 0) return jsonError("Bekleyen bir erteleme önerisi yok.", 404);
  return NextResponse.json({ message: "Erteleme önerisi geri çekildi." });
}
