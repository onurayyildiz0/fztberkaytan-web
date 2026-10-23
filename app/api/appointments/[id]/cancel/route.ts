import { NextResponse, after } from "next/server";
import { PATIENT_CANCEL_MIN_HOURS, PATIENT_CANCELLABLE, canPatientCancel } from "@/lib/appointments";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { syncAppointmentToGoogle } from "@/lib/data/appointments";
import { appointmentStartsAt, dateToKey } from "@/lib/dates";
import { sendPatientCancelledEmail } from "@/lib/emails";
import { isObjectId, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { siteConfig } from "@/lib/site";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

/**
 * POST /api/appointments/:id/cancel → hasta kendi randevusunu iptal eder.
 * Kural: bekleyen veya onaylı randevu, başlangıcına 24 saatten fazla varsa iptal edilebilir.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Randevu bulunamadı.", 404);

  try {
    await connectDB();
    const patientId = patient._id;

    // Sahiplik kontrolü: yalnızca hastanın kendi kartına bağlı randevu
    const current = await Appointment.findOne({ _id: id, patientId }).lean();
    if (!current) return jsonError("Randevu bulunamadı.", 404);

    const date = dateToKey(current.date);
    if (!canPatientCancel(current.status, appointmentStartsAt(date, current.timeSlot))) {
      return jsonError(
        PATIENT_CANCELLABLE.includes(current.status)
          ? `Randevuya ${PATIENT_CANCEL_MIN_HOURS} saatten az kaldığı için online iptal yapılamıyor. Lütfen ${siteConfig.phoneDisplay} numarasından bize ulaşın.`
          : "Bu randevu iptal edilemez.",
        409,
      );
    }

    // Durum okunduktan sonra değiştiyse işlem yapılmaz
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, patientId, status: current.status },
      { $set: { status: "cancelled", cancelledBy: "patient" } },
      { new: true },
    ).lean();
    if (!appointment) return jsonError("Randevu bu sırada güncellendi. Lütfen sayfayı yenileyin.", 409);

    const email = session.user.email ?? patient.email;
    after(async () => {
      await syncAppointmentToGoogle(id);
      // Fizyoterapiste bilgi (saat tekrar boşa çıktı)
      await sendPatientCancelledEmail(
        { serviceName: appointment.serviceName, date, timeSlot: appointment.timeSlot },
        { name: patient.name, email: email ?? "-" },
      );
    });

    return NextResponse.json({ message: "Randevunuz iptal edildi.", status: appointment.status });
  } catch (err) {
    console.error("[appointments:cancel]", err);
    return jsonError("Randevu iptal edilirken bir hata oluştu.", 500);
  }
}
