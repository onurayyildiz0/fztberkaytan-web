import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { resetRateLimit } from "@/lib/rate-limit";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";

export const PASSWORD_RESET_TTL_MINUTES = 60;
export const PASSWORD_SALT_ROUNDS = 12;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Yeni sıfırlama linki üretir (kullanıcının önceki linkleri geçersiz olur) */
export async function createPasswordResetLink(userId: Types.ObjectId, baseUrl: string): Promise<string> {
  await connectDB();
  const token = randomBytes(32).toString("base64url");
  await PasswordResetToken.deleteMany({ userId });
  await PasswordResetToken.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
  });
  return `${baseUrl}/sifre-sifirla?token=${token}`;
}

/** Sayfa açılırken linkin hâlâ geçerli olup olmadığını kontrol eder (token tüketilmez) */
export async function isPasswordResetTokenValid(token: string): Promise<boolean> {
  if (!token || token.length > 100) return false;
  await connectDB();
  return !!(await PasswordResetToken.exists({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }));
}

/**
 * Token'ı tek kullanımlık olarak tüketir ve yeni şifreyi kaydeder.
 * Link e-posta kutusuna gittiği için e-posta sahipliği de kanıtlanmış olur (doğrulanmamışsa doğrulanır).
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  if (!token || token.length > 100) return false;
  await connectDB();
  const record = await PasswordResetToken.findOneAndDelete({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!record) return false;

  const user = await User.findById(record.userId).select("email emailVerified").lean();
  if (!user) return false;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        password: await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS),
        ...(user.emailVerified ? {} : { emailVerified: new Date() }),
      },
    },
  );
  await PasswordResetToken.deleteMany({ userId: user._id });
  // Hesap kilidi varsa kaldır (şifresini unutan kullanıcı çok deneme yapmış olabilir)
  await resetRateLimit(`login:email:${user.email}`);
  return true;
}
