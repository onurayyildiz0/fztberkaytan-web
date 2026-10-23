import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

/**
 * MongoDB tabanlı sabit pencereli istek sınırlayıcı.
 * Sayaçlar "ratelimits" koleksiyonunda tutulur; TTL index sayesinde süresi dolan kayıtlar
 * MongoDB tarafından otomatik silinir. Sunucusuz/çok sunuculu ortamlarda da tutarlı çalışır.
 */

type RateLimitDoc = { _id: string; count: number; expiresAt: Date };

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

let indexReady: Promise<unknown> | null = null;

async function getCollection() {
  await connectDB();
  const col = mongoose.connection.collection<RateLimitDoc>("ratelimits");
  indexReady ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((error) => {
    indexReady = null;
    throw error;
  });
  await indexReady;
  return col;
}

function toResult(doc: RateLimitDoc | null, limit: number, now: Date): RateLimitResult {
  const count = doc && doc.expiresAt > now ? doc.count : 0;
  const retryAfterSeconds = doc ? Math.max(0, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000)) : 0;
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds };
}

/** Sayacı bir artırır; pencerede `limit` aşıldıysa ok=false döner. */
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const col = await getCollection();
  const now = new Date();
  const newExpiry = new Date(now.getTime() + windowSeconds * 1000);
  const isActive = { $gt: ["$expiresAt", now] };

  // Tek atomik işlem: pencere aktifse artır, değilse yeni pencere başlat
  const doc = await col.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [isActive, { $add: ["$count", 1] }, 1] },
          expiresAt: { $cond: [isActive, "$expiresAt", newExpiry] },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );
  return toResult(doc, limit, now);
}

/** Sayacı artırmadan, sınırın aşılıp aşılmadığını kontrol eder. */
export async function peekRateLimit(key: string, limit: number): Promise<RateLimitResult> {
  const col = await getCollection();
  const now = new Date();
  const doc = await col.findOne({ _id: key });
  const result = toResult(doc, limit, now);
  // peek'te sınıra ulaşmak da engeldir (bir sonraki deneme sınırı aşacak)
  const count = doc && doc.expiresAt > now ? doc.count : 0;
  return { ...result, ok: count < limit };
}

export async function resetRateLimit(key: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ _id: key });
}

/** İstemci IP adresi (proxy/Vercel arkasında x-forwarded-for ilk değer) */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Uygulamadaki tüm sınırlar tek yerde */
export const LIMITS = {
  /** IP başına giriş denemesi */
  loginPerIp: { limit: 20, windowSeconds: 15 * 60 },
  /** E-posta başına başarısız giriş denemesi (hesap kilitleme) */
  loginFailuresPerEmail: { limit: 8, windowSeconds: 15 * 60 },
  /** IP başına kayıt */
  registerPerIp: { limit: 5, windowSeconds: 60 * 60 },
  /** Doğrulama e-postasını yeniden gönderme */
  resendPerIp: { limit: 5, windowSeconds: 60 * 60 },
  resendPerEmail: { limit: 3, windowSeconds: 60 * 60 },
  /** Şifre sıfırlama talebi */
  passwordResetPerIp: { limit: 5, windowSeconds: 60 * 60 },
  passwordResetPerEmail: { limit: 3, windowSeconds: 60 * 60 },
  /** Hesap ayarlarında şifre doğrulaması gerektiren işlemler */
  accountActionsPerUser: { limit: 10, windowSeconds: 15 * 60 },
  /** Kullanıcı başına randevu talebi */
  appointmentsPerUser: { limit: 10, windowSeconds: 60 * 60 },
} as const;

export function tooManyRequestsMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Çok fazla deneme yaptınız. Lütfen ${minutes} dakika sonra tekrar deneyin.`;
}
