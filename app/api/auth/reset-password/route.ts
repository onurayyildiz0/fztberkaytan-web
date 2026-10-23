import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { LIMITS, consumeRateLimit, getClientIp, tooManyRequestsMessage } from "@/lib/rate-limit";
import { resetPasswordSchema, toFieldErrors } from "@/lib/validations/auth";

export const runtime = "nodejs";

/** POST /api/auth/reset-password { token, password } → bağlantıdaki token ile yeni şifre belirler */
export async function POST(request: Request) {
  const ipLimit = await consumeRateLimit(
    `reset-submit:ip:${getClientIp(request.headers)}`,
    LIMITS.loginPerIp.limit,
    LIMITS.loginPerIp.windowSeconds,
  );
  if (!ipLimit.ok) return jsonError(tooManyRequestsMessage(ipLimit.retryAfterSeconds), 429);

  const parsed = resetPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen şifrenizi kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }

  try {
    const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!ok) {
      return jsonError("Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin.", 410);
    }
    return NextResponse.json({ message: "Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz." });
  } catch (error) {
    console.error("[reset-password]", error);
    return jsonError("Şifre güncellenirken bir hata oluştu.", 500);
  }
}
