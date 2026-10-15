import { NextResponse, after } from "next/server";
import {
  ACTIVE_STATUSES,
  MAX_ACTIVE_APPOINTMENTS_PER_PATIENT,
  SLOT_DURATION_MINUTES,
} from "@/lib/appointments";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { getAvailableSlots, isBookableDate } from "@/lib/data/appointments";
import { keyToDate, slotLabel, todayKey } from "@/lib/dates";
import { sendAppointmentRequestEmails } from "@/lib/emails";
import { isDuplicateKeyError, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { LIMITS, consumeRateLimit, tooManyRequestsMessage } from "@/lib/rate-limit";
import { toFieldErrors } from "@/lib/validations/auth";
import { createAppointmentSchema } from "@/lib/validations/appointments";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";

/** POST /api/appointments → hasta yeni randevu talebi oluşturur (status: pending) */
export async function POST(request: Request) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const limit = await consumeRateLimit(
    `appointments:user:${session.user.id}`,
    LIMITS.appointmentsPerUser.limit,
    LIMITS.appointmentsPerUser.windowSeconds,
  );
  if (!limit.ok) return jsonError(tooManyRequestsMessage(limit.retryAfterSeconds), 429);

  const parsed = createAppointmentSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen randevu bilgilerini kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const { serviceName, date, time, notes } = parsed.data;

  if (!isBookableDate(date)) {
    return jsonError("Seçilen tarih için randevu alınamaz.", 400);
  }

  try {
    await connectDB();
    const patientId = patient._id;

    const activeCount = await Appointment.countDocuments({
      patientId,
      status: { $in: [...ACTIVE_STATUSES] },
      date: { $gte: keyToDate(todayKey()) },
    });
    if (activeCount >= MAX_ACTIVE_APPOINTMENTS_PER_PATIENT) {
      return jsonError(
        `Aynı anda en fazla ${MAX_ACTIVE_APPOINTMENTS_PER_PATIENT} aktif randevunuz olabilir. Yeni randevu için mevcut randevularınızdan birinin tamamlanmasını bekleyin veya iptal edin.`,
        409,
      );
    }

    const available = await getAvailableSlots(date);
    if (!available.includes(time)) {
      return jsonError("Seçtiğiniz saat artık müsait değil. Lütfen başka bir saat seçin.", 409, {
        code: "SLOT_TAKEN",
      });
    }

    const timeSlot = slotLabel(time, SLOT_DURATION_MINUTES);
    const appointment = await Appointment.create({
      patientId,
      serviceName,
      date: keyToDate(date),
      timeSlot,
      notes,
      status: "pending",
    });

    // E-postalar yanıt döndükten sonra gönderilir; hata olsa da randevu oluşmuş olur
    after(() =>
      sendAppointmentRequestEmails(
        { serviceName, date, timeSlot, notes },
        { name: patient.name, email: session.user.email ?? patient.email ?? null, phone: patient.phone },
      ),
    );

    return NextResponse.json(
      { message: "Randevu talebiniz alındı.", appointment: { id: appointment._id.toString(), date, timeSlot } },
      { status: 201 },
    );
  } catch (err) {
    // Aynı slota eşzamanlı iki talep: unique_active_slot index'i ikincisini reddeder
    if (isDuplicateKeyError(err)) {
      return jsonError("Seçtiğiniz saat artık müsait değil. Lütfen başka bir saat seçin.", 409, {
        code: "SLOT_TAKEN",
      });
    }
    console.error("[appointments:create]", err);
    return jsonError("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.", 500);
  }
}
