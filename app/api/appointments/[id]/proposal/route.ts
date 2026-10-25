import { NextResponse, after } from "next/server";
import { ACTIVE_STATUSES } from "@/lib/appointments";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { isSlotTaken, syncAppointmentToGoogle, timeSlotInterval } from "@/lib/data/appointments";
import { dateToKey } from "@/lib/dates";
import { sendProposalAnsweredEmail } from "@/lib/emails";
import { isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { serviceLabel } from "@/lib/services";
import { proposalResponseSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

/**
 * POST /api/appointments/:id/proposal { action: "accept" | "decline" }
 * Hasta, fizyoterapistin önerdiği yeni tarihi kabul eder (randevu taşınır) veya reddeder (randevu iptal olur;
 * kullanım koşulları gereği hasta yeni zamanı kabul etmek zorunda değildir).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  const parsed = proposalResponseSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Geçersiz istek.", 400);
  const { action } = parsed.data;

  try {
    await connectDB();
    const current = await Appointment.findOne({
      _id: id,
      patientId: patient._id,
      status: { $in: [...ACTIVE_STATUSES] },
      proposedDate: { $ne: null },
    }).lean();
    if (!current?.proposedDate || !current.proposedTimeSlot) {
      return jsonError("Bu randevu için bekleyen bir tarih önerisi yok.", 404);
    }

    const previous = { date: dateToKey(current.date), timeSlot: current.timeSlot };
    const proposed = { date: dateToKey(current.proposedDate), timeSlot: current.proposedTimeSlot };
    const label = serviceLabel(current.serviceName, current.serviceOption);
    const clearProposal = { proposedDate: null, proposedTimeSlot: null, proposedAt: null };

    if (action === "accept") {
      if (timeSlotInterval(proposed.date, proposed.timeSlot).start <= new Date()) {
        await Appointment.updateOne({ _id: id }, { $set: clearProposal });
        return jsonError("Önerilen saat geçti. Lütfen bizimle iletişime geçin.", 410);
      }
      if (await isSlotTaken(proposed.date, proposed.timeSlot, id)) {
        return jsonError("Önerilen saat artık müsait değil. Lütfen bizimle iletişime geçin.", 409);
      }
      const updated = await Appointment.findOneAndUpdate(
        { _id: id, proposedDate: current.proposedDate },
        {
          $set: {
            date: current.proposedDate,
            timeSlot: current.proposedTimeSlot,
            reminderSentAt: null,
            ...clearProposal,
          },
        },
        { new: true },
      ).lean();
      if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);
    } else {
      const updated = await Appointment.findOneAndUpdate(
        { _id: id, proposedDate: current.proposedDate },
        { $set: { status: "cancelled", cancelledBy: "patient", ...clearProposal } },
        { new: true },
      ).lean();
      if (!updated) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);
    }

    after(async () => {
      await syncAppointmentToGoogle(id);
      await sendProposalAnsweredEmail(action === "accept", previous, proposed, label, {
        name: patient.name,
        email: session.user.email ?? patient.email ?? "-",
      });
    });

    return NextResponse.json({
      message: action === "accept" ? "Yeni tarih onaylandı." : "Öneri reddedildi; randevunuz iptal edildi.",
    });
  } catch (err) {
    console.error("[appointments:proposal]", err);
    return jsonError("İşlem sırasında bir hata oluştu.", 500);
  }
}
