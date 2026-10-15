import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { isAdminEmail } from "@/lib/auth/admin";
import { sendAccountExistsEmail, sendVerificationEmail } from "@/lib/emails";
import { isDuplicateKeyError, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { LIMITS, consumeRateLimit, getClientIp, tooManyRequestsMessage } from "@/lib/rate-limit";
import { registerSchema, toFieldErrors } from "@/lib/validations/auth";
import { VERIFICATION_TTL_HOURS, appBaseUrl, createVerificationLink } from "@/lib/verification";
import User from "@/models/User";

export const runtime = "nodejs";

const SALT_ROUNDS = 12;

/**
 * Hesap numaralandırmayı (bir e-postanın kayıtlı olup olmadığını öğrenmeyi) önlemek için
 * yeni kayıt, mevcut hesap ve ayrılmış adres durumlarında aynı yanıt döndürülür.
 * Gerçek sonuç yalnızca e-posta sahibine iletilir.
 */
const GENERIC_SUCCESS = {
  message:
    "Kaydınız alındı. Hesabınızı etkinleştirmek için e-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.",
};

export async function POST(request: Request) {
  const ipLimit = await consumeRateLimit(
    `register:ip:${getClientIp(request.headers)}`,
    LIMITS.registerPerIp.limit,
    LIMITS.registerPerIp.windowSeconds,
  );
  if (!ipLimit.ok) return jsonError(tooManyRequestsMessage(ipLimit.retryAfterSeconds), 429);

  const parsed = registerSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen form alanlarını kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }

  const { name, email, password, phone } = parsed.data;
  const baseUrl = appBaseUrl(request);

  // Hash her durumda hesaplanır: yanıt süresi, adresin kayıtlı olup olmadığını ele vermesin
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Admin adresi herkese açık formdan kaydedilemez (bkz. scripts/set-admin-password.mjs)
  if (isAdminEmail(email)) return NextResponse.json(GENERIC_SUCCESS, { status: 201 });

  try {
    await connectDB();

    const existing = await User.findOne({ email }).select("name emailVerified").lean();
    if (existing) {
      if (existing.emailVerified) {
        after(() => sendAccountExistsEmail({ name: existing.name, email }, `${baseUrl}/giris-yap`));
      } else {
        // Doğrulanmamış hesap: yeni doğrulama bağlantısı gönder
        const link = await createVerificationLink(existing._id, baseUrl);
        after(() => sendVerificationEmail({ name: existing.name, email }, link, VERIFICATION_TTL_HOURS));
      }
      return NextResponse.json(GENERIC_SUCCESS, { status: 201 });
    }

    // Rol istemciden ALINMAZ: kayıt olan herkes "patient" olur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "patient",
      emailVerified: null,
    });

    const link = await createVerificationLink(user._id, baseUrl);
    after(() => sendVerificationEmail({ name, email }, link, VERIFICATION_TTL_HOURS));

    return NextResponse.json(GENERIC_SUCCESS, { status: 201 });
  } catch (error) {
    // Eşzamanlı iki kayıtta unique index ihlali: diğer istek hesabı oluşturdu
    if (isDuplicateKeyError(error)) return NextResponse.json(GENERIC_SUCCESS, { status: 201 });
    console.error("[register]", error);
    return jsonError("Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
