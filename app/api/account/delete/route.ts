import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { ACTIVE_STATUSES } from "@/lib/appointments";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { syncAppointmentToGoogle } from "@/lib/data/appointments";
import { keyToDate, todayKey } from "@/lib/dates";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { LIMITS, consumeRateLimit, tooManyRequestsMessage } from "@/lib/rate-limit";
import { deleteAccountSchema, toFieldErrors } from "@/lib/validations/auth";
import Appointment from "@/models/Appointment";
import PasswordResetToken from "@/models/PasswordResetToken";
import Patient from "@/models/Patient";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";

export const runtime = "nodejs";

/**
 * POST /api/account/delete { password, confirmText: "SİL" } → hasta hesabını siler (KVKK silme hakkı).
 * - Giriş hesabı ve oturum/token kayıtları silinir.
 * - Gelecekteki aktif randevular iptal edilir.
 * - Hasta kartı ve geçmiş seans kayıtları sağlık mevzuatındaki saklama yükümlülüğü nedeniyle
 *   hesaptan ayrılarak saklanır; saklama süresi sonunda silinir.
 */
export async function POST(request: Request) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const limit = await consumeRateLimit(
    `account:user:${session.user.id}`,
    LIMITS.accountActionsPerUser.limit,
    LIMITS.accountActionsPerUser.windowSeconds,
  );
  if (!limit.ok) return jsonError(tooManyRequestsMessage(limit.retryAfterSeconds), 429);

  const parsed = deleteAccountSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Lütfen bilgileri kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("+password").lean();
    if (!user) return jsonError("Hesabınız bulunamadı.", 404);
    if (!(await bcrypt.compare(parsed.data.password, user.password))) {
      return jsonError("Şifreniz hatalı.", 400, { errors: { password: "Şifreniz hatalı." } });
    }

    // Gelecekteki aktif randevuları iptal et
    const upcoming = await Appointment.find({
      patientId: patient._id,
      status: { $in: [...ACTIVE_STATUSES] },
      date: { $gte: keyToDate(todayKey()) },
    })
      .select("_id")
      .lean();
    if (upcoming.length) {
      await Appointment.updateMany(
        { _id: { $in: upcoming.map((a) => a._id) } },
        { $set: { status: "cancelled", cancelledBy: "patient" } },
      );
    }

    await Promise.all([
      Patient.updateOne({ _id: patient._id }, { $unset: { userId: 1 } }),
      VerificationToken.deleteMany({ userId: user._id }),
      PasswordResetToken.deleteMany({ userId: user._id }),
    ]);
    await User.deleteOne({ _id: user._id });

    after(async () => {
      for (const a of upcoming) await syncAppointmentToGoogle(a._id.toString());
    });

    return NextResponse.json({ message: "Hesabınız silindi.", cancelledAppointments: upcoming.length });
  } catch (err) {
    console.error("[account:delete]", err);
    return jsonError("Hesap silinirken bir hata oluştu.", 500);
  }
}
