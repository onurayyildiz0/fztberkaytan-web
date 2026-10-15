import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { ensurePatientForUser } from "@/lib/data/patients";
import { siteConfig } from "@/lib/site";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";

const TOKEN_TTL_HOURS = 24;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * E-postalardaki linklerin kök adresi.
 * Production'da Host başlığına güvenilmez (link zehirleme saldırısı); sabit adres kullanılır.
 * Geliştirmede linklerin localhost'a gitmesi için isteğin adresi kullanılır.
 */
export function appBaseUrl(request: Request): string {
  if (process.env.NODE_ENV === "production") {
    return (process.env.AUTH_URL || siteConfig.url).replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}

/** Kullanıcı için yeni doğrulama token'ı üretir (eskileri geçersiz kılar) ve linki döndürür */
export async function createVerificationLink(userId: Types.ObjectId, baseUrl: string): Promise<string> {
  await connectDB();
  const token = randomBytes(32).toString("base64url");

  await VerificationToken.deleteMany({ userId });
  await VerificationToken.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000),
  });

  return `${baseUrl}/e-posta-dogrula?token=${token}`;
}

export type VerifyResult = "verified" | "invalid";

/** Token'ı tek kullanımlık olarak tüketir ve kullanıcının e-postasını doğrulanmış işaretler */
export async function verifyEmailToken(token: string): Promise<VerifyResult> {
  if (!token || token.length > 100) return "invalid";
  await connectDB();

  const record = await VerificationToken.findOneAndDelete({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!record) return "invalid";

  const result = await User.updateOne(
    { _id: record.userId, emailVerified: null },
    { $set: { emailVerified: new Date() } },
  );
  // Kullanıcı zaten doğrulanmışsa da başarılı say
  if (result.matchedCount === 0 && !(await User.exists({ _id: record.userId }))) return "invalid";

  // Doğrulanan hastanın kartı hemen oluşsun (admin hasta listesinde görünsün)
  await ensurePatientForUser(record.userId.toString());
  return "verified";
}

export const VERIFICATION_TTL_HOURS = TOKEN_TTL_HOURS;
