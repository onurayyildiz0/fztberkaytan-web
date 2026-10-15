import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { isAdminEmail } from "@/lib/auth/admin";
import type { Role } from "@/lib/auth/roles";
import { connectDB } from "@/lib/mongodb";
import {
  LIMITS,
  consumeRateLimit,
  getClientIp,
  peekRateLimit,
  resetRateLimit,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";
import User from "@/models/User";

// Kullanıcı bulunamadığında da bcrypt karşılaştırması yapılarak
// yanıt süresi üzerinden e-posta tespiti (timing attack) zorlaştırılır.
const DUMMY_HASH = "$2b$12$UOAsNxuUDHUUihVuzDUPyOB18josPNnBaxG3e4.7f8ZYxMY2z1Pka";

/** Giriş formuna iletilen hata kodları (LoginForm bu kodlara göre mesaj gösterir) */
class TooManyAttemptsError extends CredentialsSignin {
  code = "too_many_attempts";
}
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = getClientIp(request.headers);
        const emailKey = `login:email:${email}`;

        // 1) IP başına toplam deneme sınırı (kaba kuvvet / credential stuffing)
        const ipLimit = await consumeRateLimit(
          `login:ip:${ip}`,
          LIMITS.loginPerIp.limit,
          LIMITS.loginPerIp.windowSeconds,
        );
        if (!ipLimit.ok) throw new TooManyAttemptsError();

        // 2) Hesap başına başarısız deneme sınırı (farklı IP'lerden hedefli saldırı)
        const emailLimit = await peekRateLimit(emailKey, LIMITS.loginFailuresPerEmail.limit);
        if (!emailLimit.ok) throw new TooManyAttemptsError();

        await connectDB();
        const user = await User.findOne({ email }).select("+password").lean();

        const isValid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !isValid) {
          await consumeRateLimit(
            emailKey,
            LIMITS.loginFailuresPerEmail.limit,
            LIMITS.loginFailuresPerEmail.windowSeconds,
          );
          return null;
        }

        await resetRateLimit(emailKey);

        // Rol her girişte ADMIN_EMAIL'e göre belirlenir ve veritabanıyla eşitlenir:
        // ADMIN_EMAIL değiştirildiğinde eski admin hesabı otomatik olarak hastaya döner.
        const role: Role = isAdminEmail(user.email) ? "admin" : "patient";

        // Hastalar e-postalarını doğrulamadan giriş yapamaz.
        // (Kontrol şifre doğrulandıktan sonra yapılır; böylece hesabın varlığı sızdırılmaz.)
        if (role === "patient" && !user.emailVerified) throw new EmailNotVerifiedError();

        if (user.role !== role) {
          await User.updateOne({ _id: user._id }, { $set: { role } });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role,
        };
      },
    }),
  ],
});
