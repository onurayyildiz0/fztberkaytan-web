/**
 * Tarih yardımcıları.
 *
 * Randevu tarihleri "takvim günü" olarak saklanır: YYYY-MM-DD günü, o günün UTC gece
 * yarısına karşılık gelen Date olarak tutulur (ör. 2026-10-12 → 2026-10-12T00:00:00Z).
 * Böylece sunucunun ve tarayıcının saat diliminden bağımsız olarak gün hiç kaymaz.
 * "Bugün" ve "şu an" ise her zaman klinik saat dilimine (İstanbul) göre hesaplanır.
 */
export const TIME_ZONE = "Europe/Istanbul";

export type DateKey = string; // "YYYY-MM-DD"

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string" || !DATE_KEY_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

export function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value);
}

export function keyToDate(key: DateKey): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function dateToKey(date: Date): DateKey {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToKey(d);
}

/** 0 = Pazar ... 6 = Cumartesi */
export function dayOfWeek(key: DateKey): number {
  return keyToDate(key).getUTCDay();
}

function zonedParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    key: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** İstanbul saatine göre bugünün tarihi */
export function todayKey(now = new Date()): DateKey {
  return zonedParts(now).key;
}

/** İstanbul saatine göre gün içinde geçen dakika */
export function nowMinutes(now = new Date()): number {
  return zonedParts(now).minutes;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function monthRange(key: DateKey): { start: DateKey; end: DateKey } {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start: dateToKey(start), end: dateToKey(end) };
}

const longFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});
const shortFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "12 Ekim 2026 Pazartesi" */
export function formatDateLong(key: DateKey): string {
  return longFormatter.format(keyToDate(key));
}

/** "12 Eki 2026" */
export function formatDateShort(key: DateKey): string {
  return shortFormatter.format(keyToDate(key));
}

/** Gerçek zaman damgası (ör. createdAt) için İstanbul saatine göre biçim */
export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export const WEEKDAYS = [
  { value: 1, label: "Pazartesi", short: "Pzt" },
  { value: 2, label: "Salı", short: "Sal" },
  { value: 3, label: "Çarşamba", short: "Çar" },
  { value: 4, label: "Perşembe", short: "Per" },
  { value: 5, label: "Cuma", short: "Cum" },
  { value: 6, label: "Cumartesi", short: "Cmt" },
  { value: 0, label: "Pazar", short: "Paz" },
] as const;

/**
 * Türkiye 2016'dan beri yaz/kış saati uygulamadan sabit UTC+3'tedir.
 * Randevunun gerçek başlangıç anı (hatırlatma, 24 saat iptal kuralı, Google Takvim için).
 */
export const ISTANBUL_UTC_OFFSET = "+03:00";

export function appointmentStartsAt(key: DateKey, timeSlotOrStart: string): Date {
  const start = timeSlotOrStart.split(" - ")[0] ?? timeSlotOrStart;
  return new Date(`${key}T${start}:00${ISTANBUL_UTC_OFFSET}`);
}

/** Haftanın pazartesi günü (takvim görünümü için) */
export function startOfWeek(key: DateKey): DateKey {
  const dow = dayOfWeek(key); // 0 = Pazar
  return addDays(key, dow === 0 ? -6 : 1 - dow);
}
