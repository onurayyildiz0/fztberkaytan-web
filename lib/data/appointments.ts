import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  ACTIVE_STATUSES,
  AVAILABILITY_STEP_MINUTES,
  BOOKING_WINDOW_DAYS,
  SLOT_BLOCKING_STATUSES,
  SLOT_DURATION_MINUTES,
  type AdminAppointmentDTO,
  type AppointmentDTO,
} from "@/lib/appointments";
import { addDays, appointmentStartsAt, dateToKey, keyToDate, todayKey, type DateKey } from "@/lib/dates";
import { deleteCalendarEvent, getAvailabilityBlocks, getBusyIntervals, upsertCalendarEvent } from "@/lib/google-calendar";
import { serviceLabel } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import Appointment, { type IAppointment } from "@/models/Appointment";

/* ---------- Zaman aralıkları ---------- */

export type Interval = { start: Date; end: Date };

const MINUTE = 60_000;
const ISTANBUL_OFFSET_MS = 3 * 60 * MINUTE;

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start;
}

/** "10:15 - 11:05" → gerçek başlangıç/bitiş (bitiş başlangıçtan önceyse ertesi gün) */
export function timeSlotInterval(key: DateKey, timeSlot: string): Interval {
  const [startText, endText] = timeSlot.split(" - ");
  const start = appointmentStartsAt(key, startText ?? timeSlot);
  let end = endText ? appointmentStartsAt(key, endText) : new Date(start.getTime() + SLOT_DURATION_MINUTES * MINUTE);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * MINUTE);
  return { start, end };
}

/** "10:15" + 50 dk → "10:15 - 11:05" */
export function makeTimeSlot(start: string, durationMinutes: number): string {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  const end = `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  return `${start} - ${end}`;
}

/** Date → İstanbul takvim günü ve "SS:DD" */
function toIstanbul(d: Date): { key: DateKey; time: string } {
  const shifted = new Date(d.getTime() + ISTANBUL_OFFSET_MS).toISOString();
  return { key: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

function dayStart(key: DateKey): Date {
  return appointmentStartsAt(key, "00:00");
}

/* ---------- DTO dönüşümü ---------- */

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string; phone?: string; userId?: Types.ObjectId };

type LeanAppointment = Omit<IAppointment, "patientId"> & {
  _id: Types.ObjectId;
  patientId: Types.ObjectId | PopulatedPatient | null;
};

function isPopulated(p: LeanAppointment["patientId"]): p is PopulatedPatient {
  return !!p && typeof p === "object" && "name" in p;
}

export function toAppointmentDTO(doc: LeanAppointment): AppointmentDTO {
  const p = doc.patientId;
  const date = dateToKey(doc.date);
  const interval = timeSlotInterval(date, doc.timeSlot);
  return {
    id: doc._id.toString(),
    serviceName: doc.serviceName,
    serviceOption: doc.serviceOption ?? null,
    durationMinutes: doc.durationMinutes ?? SLOT_DURATION_MINUTES,
    date,
    timeSlot: doc.timeSlot,
    startsAt: interval.start.toISOString(),
    endsAt: interval.end.toISOString(),
    proposal:
      doc.proposedDate && doc.proposedTimeSlot
        ? { date: dateToKey(doc.proposedDate), timeSlot: doc.proposedTimeSlot }
        : null,
    status: doc.status,
    notes: doc.notes ?? "",
    source: doc.source ?? "online",
    createdAt: doc.createdAt.toISOString(),
    patient: isPopulated(p)
      ? { id: p._id.toString(), name: p.name, email: p.email ?? null, phone: p.phone ?? null }
      : null,
  };
}

function toAdminAppointmentDTO(doc: LeanAppointment): AdminAppointmentDTO {
  return {
    ...toAppointmentDTO(doc),
    adminNotes: doc.adminNotes ?? "",
    cancelledBy: doc.cancelledBy ?? null,
    googleSynced: !!doc.googleEventId,
    patientHasAccount: isPopulated(doc.patientId) && !!doc.patientId.userId,
  };
}

/* ---------- Sorgular ---------- */

export type AppointmentQuery = {
  status?: IAppointment["status"] | IAppointment["status"][];
  patientId?: string;
  from?: DateKey; // dahil
  to?: DateKey; // hariç
  sort?: 1 | -1;
  limit?: number;
  /** Tarih aralığına erteleme önerisi düşen randevuları da getir */
  includeProposals?: boolean;
};

async function queryAppointments(query: AppointmentQuery): Promise<LeanAppointment[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
  if (query.patientId) filter.patientId = new Types.ObjectId(query.patientId);
  if (query.from || query.to) {
    const range = {
      ...(query.from ? { $gte: keyToDate(query.from) } : {}),
      ...(query.to ? { $lt: keyToDate(query.to) } : {}),
    };
    if (query.includeProposals) filter.$or = [{ date: range }, { proposedDate: range }];
    else filter.date = range;
  }
  const sort = query.sort ?? 1;
  let q = Appointment.find(filter)
    .sort({ date: sort, timeSlot: sort })
    .populate<{ patientId: PopulatedPatient | null }>("patientId", "name email phone userId");
  if (query.limit) q = q.limit(query.limit);
  return (await q.lean()) as unknown as LeanAppointment[];
}

/** Hasta tarafı için (admin notları vb. içermez) */
export async function findAppointments(query: AppointmentQuery = {}): Promise<AppointmentDTO[]> {
  return (await queryAppointments(query)).map(toAppointmentDTO);
}

/** Admin paneli için (admin notu, iptal eden, takvim durumu dahil) */
export async function findAdminAppointments(query: AppointmentQuery = {}): Promise<AdminAppointmentDTO[]> {
  return (await queryAppointments(query)).map(toAdminAppointmentDTO);
}

/* ---------- Müsaitlik (Google Takvim tabanlı) ---------- */

export function isBookableDate(key: DateKey, now = new Date()): boolean {
  const today = todayKey(now);
  return key >= today && key <= addDays(today, BOOKING_WINDOW_DAYS);
}

/**
 * Belirli tarih aralığında zamanı dolu tutan randevular:
 * aktif/tamamlanmış randevular + hasta onayı bekleyen erteleme önerilerinin yeni saatleri.
 */
async function blockingIntervals(from: DateKey, to: DateKey, excludeAppointmentId?: string): Promise<Interval[]> {
  await connectDB();
  const range = { $gte: keyToDate(from), $lte: keyToDate(to) };
  const exclude = excludeAppointmentId ? { _id: { $ne: new Types.ObjectId(excludeAppointmentId) } } : {};
  const [booked, proposals] = await Promise.all([
    Appointment.find({ date: range, status: { $in: [...SLOT_BLOCKING_STATUSES] }, ...exclude })
      .select("date timeSlot")
      .lean(),
    Appointment.find({ proposedDate: range, status: { $in: [...ACTIVE_STATUSES] }, ...exclude })
      .select("proposedDate proposedTimeSlot")
      .lean(),
  ]);
  return [
    ...booked.map((a) => timeSlotInterval(dateToKey(a.date), a.timeSlot)),
    ...proposals
      .filter((a) => a.proposedDate && a.proposedTimeSlot)
      .map((a) => timeSlotInterval(dateToKey(a.proposedDate!), a.proposedTimeSlot!)),
  ];
}

type AvailabilityOptions = {
  now?: Date;
  /** Admin: 60 günlük sınır uygulanmaz */
  admin?: boolean;
  /** Ertelemede randevunun kendisi dolu sayılmaz */
  excludeAppointmentId?: string;
};

/**
 * Tarih aralığındaki her gün için randevuya uygun başlangıç saatleri ("SS:DD").
 * Kural: Başlangıç ve bitiş "Randevu Müsaitliği" takvimindeki bir bloğun içinde olmalı; ana takvimdeki
 * dolu etkinliklerle ve diğer randevularla çakışmamalı; geçmişte olmamalı. Başlangıçlar 15 dk aralıklıdır.
 */
export async function getAvailability(
  from: DateKey,
  to: DateKey,
  durationMinutes: number,
  options: AvailabilityOptions = {},
): Promise<Map<DateKey, string[]>> {
  const now = options.now ?? new Date();
  const result = new Map<DateKey, string[]>();
  const today = todayKey(now);
  const first = from < today ? today : from;
  const last = options.admin ? to : [to, addDays(today, BOOKING_WINDOW_DAYS)].sort()[0]!;
  if (first > last) return result;

  const rangeStart = dayStart(first);
  const rangeEnd = dayStart(addDays(last, 1));
  const [blocks, busy, booked] = await Promise.all([
    getAvailabilityBlocks(rangeStart, rangeEnd),
    getBusyIntervals(rangeStart, rangeEnd),
    blockingIntervals(first, last, options.excludeAppointmentId),
  ]);
  if (!blocks?.length) return result;

  const taken = [...busy, ...booked];
  const step = AVAILABILITY_STEP_MINUTES * MINUTE;
  const duration = durationMinutes * MINUTE;

  for (const block of blocks) {
    // İlk başlangıç: bloğun başlangıcından sonraki ilk 15 dakikalık saat
    let t = Math.ceil(Math.max(block.start.getTime(), rangeStart.getTime()) / step) * step;
    const blockEnd = Math.min(block.end.getTime(), rangeEnd.getTime());
    for (; t + duration <= blockEnd; t += step) {
      const candidate = { start: new Date(t), end: new Date(t + duration) };
      if (candidate.start <= now) continue;
      if (taken.some((i) => overlaps(i, candidate))) continue;
      const { key, time } = toIstanbul(candidate.start);
      if (key < first || key > last) continue;
      const list = result.get(key) ?? [];
      if (!list.includes(time)) list.push(time);
      result.set(key, list);
    }
  }
  for (const [key, list] of result) result.set(key, list.sort());
  return result;
}

export async function getAvailableStarts(
  key: DateKey,
  durationMinutes: number,
  options: AvailabilityOptions = {},
): Promise<string[]> {
  return (await getAvailability(key, key, durationMinutes, options)).get(key) ?? [];
}

/** Verilen saat aralığı başka bir randevuyla (veya bekleyen erteleme önerisiyle) çakışıyor mu */
export async function isSlotTaken(key: DateKey, timeSlot: string, excludeAppointmentId?: string): Promise<boolean> {
  const wanted = timeSlotInterval(key, timeSlot);
  const day = (await blockingIntervals(addDays(key, -1), addDays(key, 1), excludeAppointmentId));
  return day.some((i) => overlaps(i, wanted));
}

/**
 * Eşzamanlı iki kayıt aynı aralığı alırsa: daha sonra oluşturulan (büyük _id) kayıt geri alınır.
 * Kaydı oluşturduktan hemen sonra çağrılır; çakışma varsa kendi kaydını siler ve true döner.
 */
export async function rollbackIfOverlapping(appointmentId: Types.ObjectId, key: DateKey, timeSlot: string): Promise<boolean> {
  const wanted = timeSlotInterval(key, timeSlot);
  const others = await Appointment.find({
    _id: { $lt: appointmentId },
    date: { $gte: keyToDate(addDays(key, -1)), $lte: keyToDate(addDays(key, 1)) },
    status: { $in: [...SLOT_BLOCKING_STATUSES] },
  })
    .select("date timeSlot")
    .lean();
  const conflict = others.some((a) => overlaps(timeSlotInterval(dateToKey(a.date), a.timeSlot), wanted));
  if (conflict) await Appointment.deleteOne({ _id: appointmentId });
  return conflict;
}

/* ---------- Google Takvim senkronizasyonu ---------- */

/**
 * Randevunun Google Takvim'deki karşılığını günceller:
 * onaylı / tamamlanmış → etkinlik var; bekleyen, iptal, red, gelmedi → etkinlik yok.
 * Hata fırlatmaz (randevu işlemi takvim yüzünden başarısız olmamalı).
 */
export async function syncAppointmentToGoogle(appointmentId: string): Promise<void> {
  try {
    await connectDB();
    const doc = await Appointment.findById(appointmentId)
      .populate<{ patientId: PopulatedPatient | null }>("patientId", "name phone")
      .lean();
    if (!doc) return;

    const shouldExist = doc.status === "approved" || doc.status === "completed";
    if (!shouldExist) {
      if (doc.googleEventId && (await deleteCalendarEvent(doc.googleEventId))) {
        await Appointment.updateOne({ _id: doc._id }, { $set: { googleEventId: null } });
      }
      return;
    }

    // Tamamlanmış randevunun etkinliğine dokunma (geçmiş kaydı korunur)
    if (doc.status === "completed" && doc.googleEventId) return;

    const date = dateToKey(doc.date);
    const { start, end } = timeSlotInterval(date, doc.timeSlot);
    const patient = doc.patientId;
    const label = serviceLabel(doc.serviceName, doc.serviceOption);
    // KVKK aydınlatma metninde belirtildiği üzere şikâyet açıklaması da takvime aktarılır
    const eventId = await upsertCalendarEvent(
      {
        appointmentId: doc._id.toString(),
        summary: `${patient?.name ?? "Hasta"} – ${label}`,
        description: [
          `Hizmet: ${label}`,
          patient?.phone ? `Telefon: ${patient.phone}` : null,
          doc.notes ? `Şikâyet: ${doc.notes}` : null,
          doc.source === "admin" ? "Klinikten oluşturuldu" : "Online randevu",
          `Panel: ${siteConfig.url.replace(/\/$/, "")}/admin/takvim?tarih=${date}`,
        ]
          .filter(Boolean)
          .join("\n"),
        start,
        end,
        location: siteConfig.address.full,
      },
      doc.googleEventId,
    );
    if (eventId && eventId !== doc.googleEventId) {
      await Appointment.updateOne({ _id: doc._id }, { $set: { googleEventId: eventId } });
    }
  } catch (error) {
    console.error("[google-calendar:sync]", error);
  }
}

/* ---------- Takvim görünümü için müsaitlik blokları ---------- */

export type DayBlock = { start: string; end: string };

/**
 * Tarih aralığındaki "Randevu Müsaitliği" bloklarını gün gün "SS:DD" olarak döndürür.
 * null: müsaitlik takvimi ayarlanmamış veya okunamadı.
 */
export async function getAvailabilityBlocksByDay(from: DateKey, to: DateKey): Promise<Record<DateKey, DayBlock[]> | null> {
  const blocks = await getAvailabilityBlocks(dayStart(from), dayStart(addDays(to, 1)));
  if (!blocks) return null;
  const byDay: Record<DateKey, DayBlock[]> = {};
  for (const block of blocks) {
    // Gece yarısını aşan blokları günlere böl
    let cursor = block.start;
    while (cursor < block.end) {
      const { key, time } = toIstanbul(cursor);
      const nextMidnight = dayStart(addDays(key, 1));
      const segmentEnd = block.end < nextMidnight ? block.end : nextMidnight;
      const endTime = segmentEnd.getTime() === nextMidnight.getTime() ? "24:00" : toIstanbul(segmentEnd).time;
      if (key >= from && key <= to) (byDay[key] ??= []).push({ start: time, end: endTime });
      cursor = segmentEnd;
    }
  }
  for (const key of Object.keys(byDay)) byDay[key]!.sort((a, b) => a.start.localeCompare(b.start));
  return byDay;
}
