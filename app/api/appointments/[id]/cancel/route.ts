import { NextResponse, after } from "next/server";
import { PATIENT_CANCELLABLE } from "@/lib/appointments";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { dateToKey } from "@/lib/dates";
import { sendPatientCancelledEmail } from "@/lib/emails";
import { isObjectId, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

/** POST /api/appointments/:id/cancel → hasta kendi beklemedeki randevusunu iptal eder */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  try {
    await connectDB();
    const patientId = patient._id;

    // Sahiplik ve durum kontrolü tek atomik sorguda
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, patientId, status: { $in: [...PATIENT_CANCELLABLE] } },
      { $set: { status: "cancelled" } },
      { new: true },
    ).lean();

    if (!appointment) {
      const exists = await Appointment.exists({ _id: id, patientId });
      return exists
        ? jsonError("Yalnızca beklemedeki randevular iptal edilebilir.", 409)
        : jsonError("Randevu bulunamadı.", 404);
    }

    const email = session.user.email ?? patient.email;
    if (email) {
      after(() =>
        sendPatientCancelledEmail(
          { serviceName: appointment.serviceName, date: dateToKey(appointment.date), timeSlot: appointment.timeSlot },
          { name: patient.name, email },
        ),
      );
    }

    return NextResponse.json({ message: "Randevunuz iptal edildi.", status: appointment.status });
  } catch (err) {
    console.error("[appointments:cancel]", err);
    return jsonError("Randevu iptal edilirken bir hata oluştu.", 500);
  }
}
