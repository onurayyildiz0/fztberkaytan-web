import { NextResponse, after } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth/admin";
import { sendVerificationEmail } from "@/lib/emails";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import {
  EMAIL_BUDGET_EXHAUSTED_MESSAGE,
  LIMITS,
  consumePublicEmailBudget,
  consumeRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/rate-limit";
import { VERIFICATION_TTL_HOURS, appBaseUrl, createVerificationLink } from "@/lib/verification";
import User from "@/models/User";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

const GENERIC = {
  message: "Bu e-posta adresine ait doğrulanmamış bir hesap varsa yeni doğrulama bağlantısı gönderildi.",
};

/** POST /api/auth/resend-verification { email } → doğrulama e-postasını yeniden gönderir */
export async function POST(request: Request) {
  const ipLimit = await consumeRateLimit(
    `resend:ip:${getClientIp(request.headers)}`,
    LIMITS.resendPerIp.limit,
    LIMITS.resendPerIp.windowSeconds,
  );
  if (!ipLimit.ok) return jsonError(tooManyRequestsMessage(ipLimit.retryAfterSeconds), 429);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Geçerli bir e-posta adresi girin.", 400);
  const { email } = parsed.data;

  const emailLimit = await consumeRateLimit(
    `resend:email:${email}`,
    LIMITS.resendPerEmail.limit,
    LIMITS.resendPerEmail.windowSeconds,
  );
  if (!emailLimit.ok) return jsonError(tooManyRequestsMessage(emailLimit.retryAfterSeconds), 429);
  const budget = await consumePublicEmailBudget();
  if (!budget.ok) return jsonError(EMAIL_BUDGET_EXHAUSTED_MESSAGE, 429);

  if (isAdminEmail(email)) return NextResponse.json(GENERIC);

  try {
    await connectDB();
    const user = await User.findOne({ email, emailVerified: null }).select("name").lean();
    if (user) {
      const link = await createVerificationLink(user._id, appBaseUrl(request));
      after(() => sendVerificationEmail({ name: user.name, email }, link, VERIFICATION_TTL_HOURS));
    }
    // Hesap olsun olmasın aynı yanıt (hesap numaralandırmayı önler)
    return NextResponse.json(GENERIC);
  } catch (error) {
    console.error("[resend-verification]", error);
    return jsonError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
