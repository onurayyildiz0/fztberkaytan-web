import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { Types } from "mongoose";
import { syncAppointmentToGoogle } from "@/lib/data/appointments";
import { addDays, appointmentStartsAt, dateToKey, keyToDate, todayKey } from "@/lib/dates";
import { sendReminderEmail } from "@/lib/emails";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { connectDB } from "@/lib/mongodb";
import { serviceLabel } from "@/lib/services";
import Appointment from "@/models/Appointment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string; userId?: Types.ObjectId } | null;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/**
 * GET /api/cron/daily — günde bir kez çalışır (harici zamanlayıcı, cron-job.org → her gün 10:00 TR).
 * 1) Saati geçmiş ama hâlâ beklemede kalan talepleri düşürür.
 * 2) Yarınki onaylı randevular için hatırlatma e-postası gönderir.
 * 3) Google Takvim'e eklenememiş onaylı randevuları tekrar dener.
 * 4) Saati geçmiş ve yanıtlanmamış erteleme önerilerini kaldırır.
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });

  await connectDB();
  const now = new Date();
  const today = todayKey(now);
  const tomorrow = addDays(today, 1);

  // 1) Süresi geçen bekleyen talepler
  const stalePending = await Appointment.find({ status: "pending", date: { $lte: keyToDate(today) } })
    .select("date timeSlot")
    .lean();
  const expiredIds = stalePending
    .filter((a) => appointmentStartsAt(dateToKey(a.date), a.timeSlot) <= now)
    .map((a) => a._id);
  const expired = expiredIds.length
    ? (
        await Appointment.updateMany(
          { _id: { $in: expiredIds }, status: "pending" },
          { $set: { status: "cancelled", cancelledBy: "system" } },
        )
      ).modifiedCount
    : 0;

  // 2) Yarının hatırlatmaları (her randevu için tek sefer: atomik olarak işaretlenir)
  let reminded = 0;
  let skippedNoEmail = 0;
  const due = await Appointment.find({ status: "approved", date: keyToDate(tomorrow), reminderSentAt: null })
    .select("_id")
    .lean();
  for (const { _id } of due) {
    const claimed = await Appointment.findOneAndUpdate(
      { _id, status: "approved", reminderSentAt: null },
      { $set: { reminderSentAt: new Date() } },
      { new: true },
    )
      .populate<{ patientId: PopulatedPatient }>("patientId", "name email userId")
      .lean();
    const patient = claimed?.patientId;
    if (!claimed || !patient) continue;
    if (!patient.email) {
      skippedNoEmail++;
      continue;
    }
    await sendReminderEmail(
      { serviceName: serviceLabel(claimed.serviceName, claimed.serviceOption), date: tomorrow, timeSlot: claimed.timeSlot },
      { name: patient.name, email: patient.email },
      !!patient.userId,
    );
    reminded++;
  }

  // 3) Takvime eklenememiş onaylı randevular
  let calendarRetried = 0;
  if (isGoogleCalendarConfigured()) {
    const unsynced = await Appointment.find({
      status: "approved",
      date: { $gte: keyToDate(today) },
      $or: [{ googleEventId: null }, { googleEventId: { $exists: false } }],
    })
      .select("_id")
      // Her deneme 8 sn'ye kadar sürebilir; Netlify fonksiyon süresi içinde kalmak için az sayıda (kalanlar ertesi gün)
      .limit(10)
      .lean();
    for (const { _id } of unsynced) {
      await syncAppointmentToGoogle(_id.toString());
      calendarRetried++;
    }
  }

  // 4) Yanıtlanmamış ve önerilen saati geçmiş erteleme önerileri
  const staleProposals = await Appointment.find({ proposedDate: { $ne: null, $lte: keyToDate(today) } })
    .select("proposedDate proposedTimeSlot")
    .lean();
  const staleIds = staleProposals
    .filter((a) => a.proposedDate && a.proposedTimeSlot && appointmentStartsAt(dateToKey(a.proposedDate), a.proposedTimeSlot) <= now)
    .map((a) => a._id);
  const proposalsExpired = staleIds.length
    ? (
        await Appointment.updateMany(
          { _id: { $in: staleIds } },
          { $set: { proposedDate: null, proposedTimeSlot: null, proposedAt: null } },
        )
      ).modifiedCount
    : 0;

  return NextResponse.json({
    ok: true,
    ranAt: now.toISOString(),
    expired,
    reminded,
    skippedNoEmail,
    calendarRetried,
    proposalsExpired,
  });
}
