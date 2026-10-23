import { NextResponse, after } from "next/server";
import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAvailableSlots, isSlotTaken, syncAppointmentToGoogle } from "@/lib/data/appointments";
import { keyToDate, slotLabel, todayKey } from "@/lib/dates";
import { sendClinicAppointmentEmail } from "@/lib/emails";
import { isDuplicateKeyError, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { toFieldErrors } from "@/lib/validations/auth";
import { adminCreateAppointmentSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";

export const runtime = "nodejs";

/** POST /api/admin/appointments → fizyoterapist hasta için randevu oluşturur (doğrudan onaylı) */
export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = adminCreateAppointmentSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen randevu bilgilerini kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const { patientId, serviceName, date, time, notes, adminNotes, allowOutsideHours, notifyPatient } = parsed.data;

  if (date < todayKey()) return jsonError("Geçmiş bir tarihe randevu oluşturulamaz.", 400);

  try {
    await connectDB();
    const patient = await Patient.findById(patientId).select("name email phone userId").lean();
    if (!patient) return jsonError("Hasta bulunamadı.", 404);

    const timeSlot = slotLabel(time, SLOT_DURATION_MINUTES);

    if (allowOutsideHours) {
      if (await isSlotTaken(date, timeSlot)) {
        return jsonError("Bu saatte başka bir randevu var.", 409, { code: "SLOT_TAKEN" });
      }
    } else {
      const available = await getAvailableSlots(date, { admin: true });
      if (!available.includes(time)) {
        return jsonError(
          "Bu saat müsait değil (dolu, kapalı gün, çalışma saati dışı veya Google Takvim'de etkinlik var). Yine de eklemek için 'Çalışma saati dışında ekle' seçeneğini kullanın.",
          409,
          { code: "SLOT_UNAVAILABLE" },
        );
      }
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      serviceName,
      date: keyToDate(date),
      timeSlot,
      notes,
      adminNotes,
      status: "approved",
      source: "admin",
    });
    const id = appointment._id.toString();

    after(async () => {
      await syncAppointmentToGoogle(id);
      if (notifyPatient) {
        await sendClinicAppointmentEmail(
          { serviceName, date, timeSlot },
          { name: patient.name, email: patient.email ?? null },
          !!patient.userId,
        );
      }
    });

    return NextResponse.json({ message: "Randevu oluşturuldu.", id }, { status: 201 });
  } catch (err) {
    if (isDuplicateKeyError(err)) return jsonError("Bu saatte başka bir randevu var.", 409, { code: "SLOT_TAKEN" });
    console.error("[admin:appointments:create]", err);
    return jsonError("Randevu oluşturulurken bir hata oluştu.", 500);
  }
}
