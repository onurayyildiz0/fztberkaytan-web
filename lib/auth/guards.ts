import "server-only";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { ensurePatientForUser, type LeanPatient } from "@/lib/data/patients";

type Guarded = { session: Session; error: null } | { session: null; error: NextResponse };

/**
 * Admin kontrolü JWT'deki role ek olarak e-postayı da ADMIN_EMAIL ile karşılaştırır;
 * böylece ADMIN_EMAIL değiştirildiğinde eski adresin açık oturumları anında yetkisini kaybeder.
 */
function isAdminSession(session: Session | null): session is Session {
  return !!session && session.user.role === "admin" && isAdminEmail(session.user.email);
}

function isPatientSession(session: Session | null): session is Session {
  return !!session && session.user.role === "patient" && !isAdminEmail(session.user.email);
}

/* ---------- API route'ları için ---------- */

export async function requireAdminApi(): Promise<Guarded> {
  const session = await auth();
  if (!session) return { session: null, error: NextResponse.json({ message: "Oturum açmanız gerekiyor." }, { status: 401 }) };
  if (!isAdminSession(session)) return { session: null, error: NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 }) };
  return { session, error: null };
}

export async function requirePatientApi(): Promise<Guarded> {
  const session = await auth();
  if (!session) return { session: null, error: NextResponse.json({ message: "Oturum açmanız gerekiyor." }, { status: 401 }) };
  if (!isPatientSession(session)) return { session: null, error: NextResponse.json({ message: "Bu işlem yalnızca hasta hesapları içindir." }, { status: 403 }) };
  return { session, error: null };
}

/* ---------- Sunucu bileşenleri / layout'lar için ---------- */

export async function requireAdminPage(): Promise<Session> {
  const session = await auth();
  if (!session) redirect("/giris-yap?callbackUrl=/admin");
  if (!isAdminSession(session)) redirect("/");
  return session;
}

export async function requirePatientPage(): Promise<Session> {
  const session = await auth();
  if (!session) redirect("/giris-yap?callbackUrl=/hasta-paneli");
  if (!isPatientSession(session)) redirect("/");
  return session;
}

/* ---------- Hasta kartı ile birlikte (randevu vb. işlemler kartla yapılır) ---------- */

type PatientGuarded =
  | { session: Session; patient: LeanPatient; error: null }
  | { session: null; patient: null; error: NextResponse };

export async function requirePatientWithCardApi(): Promise<PatientGuarded> {
  const { session, error } = await requirePatientApi();
  if (error) return { session: null, patient: null, error };
  const patient = await ensurePatientForUser(session.user.id);
  if (!patient) {
    return {
      session: null,
      patient: null,
      error: NextResponse.json({ message: "Hesabınız bulunamadı. Lütfen tekrar giriş yapın." }, { status: 401 }),
    };
  }
  return { session, patient, error: null };
}

export async function requirePatientWithCardPage(): Promise<{ session: Session; patient: LeanPatient }> {
  const session = await requirePatientPage();
  const patient = await ensurePatientForUser(session.user.id);
  if (!patient) redirect("/giris-yap");
  return { session, patient };
}
