import { NextResponse, after } from "next/server";
import { sendPasswordResetEmail } from "@/lib/emails";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { PASSWORD_RESET_TTL_MINUTES, createPasswordResetLink } from "@/lib/password-reset";
import {
  EMAIL_BUDGET_EXHAUSTED_MESSAGE,
  LIMITS,
  consumePublicEmailBudget,
  consumeRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { appBaseUrl } from "@/lib/verification";
import User from "@/models/User";

export const runtime = "nodejs";

// Hesap olsun olmasın aynı yanıt: e-postanın kayıtlı olup olmadığı öğrenilemez
const GENERIC = {
  message: "Bu e-posta adresiyle kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.",
};

/** POST /api/auth/forgot-password { email } → şifre sıfırlama bağlantısı gönderir */
export async function POST(request: Request) {
  const ipLimit = await consumeRateLimit(
    `reset:ip:${getClientIp(request.headers)}`,
    LIMITS.passwordResetPerIp.limit,
    LIMITS.passwordResetPerIp.windowSeconds,
  );
  if (!ipLimit.ok) return jsonError(tooManyRequestsMessage(ipLimit.retryAfterSeconds), 429);

  const parsed = forgotPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Geçerli bir e-posta adresi girin.", 400);
  const { email } = parsed.data;

  const emailLimit = await consumeRateLimit(
    `reset:email:${email}`,
    LIMITS.passwordResetPerEmail.limit,
    LIMITS.passwordResetPerEmail.windowSeconds,
  );
  if (!emailLimit.ok) return jsonError(tooManyRequestsMessage(emailLimit.retryAfterSeconds), 429);
  const budget = await consumePublicEmailBudget();
  if (!budget.ok) return jsonError(EMAIL_BUDGET_EXHAUSTED_MESSAGE, 429);

  try {
    await connectDB();
    const user = await User.findOne({ email }).select("name email").lean();
    if (user) {
      const link = await createPasswordResetLink(user._id, appBaseUrl(request));
      after(() => sendPasswordResetEmail({ name: user.name, email: user.email }, link, PASSWORD_RESET_TTL_MINUTES));
    }
    return NextResponse.json(GENERIC);
  } catch (error) {
    console.error("[forgot-password]", error);
    return jsonError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
