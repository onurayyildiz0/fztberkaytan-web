import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requirePatientApi } from "@/lib/auth/guards";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { PASSWORD_SALT_ROUNDS } from "@/lib/password-reset";
import { LIMITS, consumeRateLimit, tooManyRequestsMessage } from "@/lib/rate-limit";
import { changePasswordSchema, toFieldErrors } from "@/lib/validations/auth";
import User from "@/models/User";

export const runtime = "nodejs";

/** POST /api/account/password { currentPassword, newPassword } → şifre değiştirme */
export async function POST(request: Request) {
  const { session, error } = await requirePatientApi();
  if (error) return error;

  const limit = await consumeRateLimit(
    `account:user:${session.user.id}`,
    LIMITS.accountActionsPerUser.limit,
    LIMITS.accountActionsPerUser.windowSeconds,
  );
  if (!limit.ok) return jsonError(tooManyRequestsMessage(limit.retryAfterSeconds), 429);

  const parsed = changePasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen şifrelerinizi kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) {
    return jsonError("Yeni şifre mevcut şifrenizle aynı olamaz.", 400, { errors: { newPassword: "Farklı bir şifre seçin." } });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("+password").lean();
    if (!user) return jsonError("Hesabınız bulunamadı.", 404);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return jsonError("Mevcut şifreniz hatalı.", 400, { errors: { currentPassword: "Mevcut şifreniz hatalı." } });
    }
    await User.updateOne({ _id: user._id }, { $set: { password: await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS) } });
    return NextResponse.json({ message: "Şifreniz güncellendi." });
  } catch (err) {
    console.error("[account:password]", err);
    return jsonError("Şifre güncellenirken bir hata oluştu.", 500);
  }
}
