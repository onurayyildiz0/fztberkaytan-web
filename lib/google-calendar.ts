import "server-only";
import { createSign } from "node:crypto";

/**
 * Google Takvim entegrasyonu (servis hesabı ile, kullanıcı girişi gerektirmez).
 *
 * Kurulum: Google Cloud'da servis hesabı oluşturulur, Calendar API açılır ve fizyoterapistin
 * takvimi "Etkinliklerde değişiklik yapma" yetkisiyle servis hesabının e-postasıyla paylaşılır.
 * Ortam değişkenleri: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY,
 *   GOOGLE_CALENDAR_ID (randevuların yazıldığı ve dolu saatlerin okunduğu takvim).
 *
 * Bu modül hata fırlatmaz: Google'a ulaşılamazsa randevu sistemi takvimsiz çalışmaya devam eder.
 */

// Adresler yalnızca otomatik testlerde sahte sunucuya yönlendirmek için değiştirilebilir
const TOKEN_URL = process.env.GOOGLE_OAUTH_TOKEN_URL || "https://oauth2.googleapis.com/token";
const API = process.env.GOOGLE_CALENDAR_API_BASE || "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";
export const CALENDAR_TIME_ZONE = "Europe/Istanbul";

type Config = { email: string; privateKey: string; calendarId: string };

function getConfig(): Config | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!email || !privateKey || !calendarId) return null;
  return { email, privateKey, calendarId };
}

export function isGoogleCalendarConfigured(): boolean {
  return getConfig() !== null;
}

/* ---------- Erişim token'ı (servis hesabı JWT → OAuth token) ---------- */

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(config: Config): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: config.email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(config.privateKey).toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`Google token alınamadı: ${data.error_description ?? res.status}`);
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

async function googleFetch(config: Config, path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken(config);
  return fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(8000),
  });
}

const calendarPath = (config: Config) => `/calendars/${encodeURIComponent(config.calendarId)}`;

/* ---------- Takvim etkinliklerinin okunması ---------- */

/** title: etkinlik başlığı (ör. hasta adı) — yalnızca admin görünümlerinde kullanılır, hastalara gönderilmez */
export type BusyInterval = { start: Date; end: Date; title?: string };

type RawEvent = {
  status?: string;
  summary?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
};

const eventsCache = new Map<string, { at: number; value: RawEvent[] }>();
const EVENTS_CACHE_MS = 60_000;

/** Tüm gün etkinliğinin tarihini (YYYY-MM-DD) İstanbul gece yarısına çevirir */
function allDayToDate(key: string): Date {
  return new Date(`${key}T00:00:00+03:00`);
}

function eventInterval(e: RawEvent): BusyInterval | null {
  const title = e.summary?.trim() || undefined;
  if (e.start?.dateTime && e.end?.dateTime) return { start: new Date(e.start.dateTime), end: new Date(e.end.dateTime), title };
  if (e.start?.date && e.end?.date) return { start: allDayToDate(e.start.date), end: allDayToDate(e.end.date), title };
  return null;
}

async function listEvents(config: Config, calendarId: string, timeMin: Date, timeMax: Date): Promise<RawEvent[]> {
  const key = `${calendarId}|${timeMin.toISOString()}|${timeMax.toISOString()}`;
  const cached = eventsCache.get(key);
  if (cached && Date.now() - cached.at < EVENTS_CACHE_MS) return cached.value;

  const items: RawEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await googleFetch(config, `/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
    const data = (await res.json()) as { items?: RawEvent[]; nextPageToken?: string; error?: { message?: string } };
    if (!res.ok) throw new Error(`Etkinlikler alınamadı (${calendarId}): ${data.error?.message ?? res.status}`);
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  const value = items.filter((e) => e.status !== "cancelled");
  eventsCache.set(key, { at: Date.now(), value });
  return value;
}

/**
 * Ana takvimdeki dolu aralıklar (iki yönlü senkron: fizyoterapistin kişisel etkinlikleri saati kapatır).
 * - "Müsait" (transparent) olarak işaretlenmiş etkinlikler sayılmaz.
 * - Bu sistemin oluşturduğu randevu etkinlikleri sayılmaz; randevular zaten veritabanından hesaplanır.
 */
export async function getBusyIntervals(timeMin: Date, timeMax: Date): Promise<BusyInterval[]> {
  const config = getConfig();
  if (!config) return [];
  try {
    const events = await listEvents(config, config.calendarId, timeMin, timeMax);
    return events
      .filter((e) => e.transparency !== "transparent")
      .filter((e) => e.extendedProperties?.private?.source !== "fztberkaytan")
      .map(eventInterval)
      .filter((i): i is BusyInterval => i !== null);
  } catch (error) {
    console.error("[google-calendar] Dolu saatler alınamadı:", error);
    return [];
  }
}

export function clearBusyCache() {
  eventsCache.clear();
}

/* ---------- Etkinlik oluşturma / güncelleme / silme ---------- */

export type CalendarEventInput = {
  appointmentId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
};

function eventBody(input: CalendarEventInput) {
  return {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: input.start.toISOString(), timeZone: CALENDAR_TIME_ZONE },
    end: { dateTime: input.end.toISOString(), timeZone: CALENDAR_TIME_ZONE },
    // Etkinliğin bu sistemden geldiğini işaretler
    extendedProperties: { private: { appointmentId: input.appointmentId, source: "fztberkaytan" } },
    reminders: { useDefault: true },
  };
}

/** Etkinliği oluşturur ya da günceller; etkinlik kimliğini döndürür (başarısızsa null). */
export async function upsertCalendarEvent(input: CalendarEventInput, existingEventId?: string | null): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;
  try {
    if (existingEventId) {
      const res = await googleFetch(config, `${calendarPath(config)}/events/${encodeURIComponent(existingEventId)}`, {
        method: "PATCH",
        body: JSON.stringify(eventBody(input)),
      });
      if (res.ok) return existingEventId;
      // Etkinlik takvimden elle silinmişse yeniden oluştur
      if (res.status !== 404 && res.status !== 410) throw new Error(`Etkinlik güncellenemedi: ${res.status}`);
    }
    const res = await googleFetch(config, `${calendarPath(config)}/events`, {
      method: "POST",
      body: JSON.stringify(eventBody(input)),
    });
    const data = (await res.json()) as { id?: string; error?: { message?: string } };
    if (!res.ok || !data.id) throw new Error(`Etkinlik oluşturulamadı: ${data.error?.message ?? res.status}`);
    return data.id;
  } catch (error) {
    console.error("[google-calendar]", error);
    return null;
  } finally {
    clearBusyCache();
  }
}

/** Etkinliği siler. Zaten yoksa da başarılı sayılır. */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;
  try {
    const res = await googleFetch(config, `${calendarPath(config)}/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 404 || res.status === 410) return true;
    throw new Error(`Etkinlik silinemedi: ${res.status}`);
  } catch (error) {
    console.error("[google-calendar]", error);
    return false;
  } finally {
    clearBusyCache();
  }
}

/** Tek bir takvimin erişilebilirliğini test eder */
async function testCalendar(config: Config, calendarId: string): Promise<{ ok: boolean; summary?: string; error?: string }> {
  const res = await googleFetch(config, `/calendars/${encodeURIComponent(calendarId)}`);
  const data = (await res.json()) as { summary?: string; error?: { message?: string } };
  if (res.ok) return { ok: true, summary: data.summary ?? calendarId };
  return {
    ok: false,
    error:
      res.status === 404
        ? `${calendarId} bulunamadı; servis hesabıyla paylaşıldığından emin olun.`
        : (data.error?.message ?? String(res.status)),
  };
}

/** Bağlantı testi (admin paneli için) */
export async function testGoogleCalendar(): Promise<{ ok: boolean; message: string }> {
  const config = getConfig();
  if (!config) return { ok: false, message: "Google Takvim ayarları yapılmamış." };
  try {
    const main = await testCalendar(config, config.calendarId);
    return main.ok ? { ok: true, message: `Bağlı: ${main.summary}` } : { ok: false, message: main.error ?? "Takvime erişilemedi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Bağlantı kurulamadı." };
  }
}
