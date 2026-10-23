import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  BOOKING_WINDOW_DAYS,
  SLOT_BLOCKING_STATUSES,
  SLOT_DURATION_MINUTES,
  type AdminAppointmentDTO,
  type AppointmentDTO,
} from "@/lib/appointments";
import {
  addDays,
  appointmentStartsAt,
  dateToKey,
  dayOfWeek,
  keyToDate,
  todayKey,
  type DateKey,
} from "@/lib/dates";
import { deleteCalendarEvent, getBusyIntervals, upsertCalendarEvent } from "@/lib/google-calendar";
import { siteConfig } from "@/lib/site";
import Appointment, { type IAppointment } from "@/models/Appointment";
import ClosedDay from "@/models/ClosedDay";
import WorkingHours from "@/models/WorkingHours";

type PopulatedPatient = { _id: Types.ObjectId; name: string; email?: string; phone?: string };

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
  return {
    id: doc._id.toString(),
    serviceName: doc.serviceName,
    date,
    timeSlot: doc.timeSlot,
    startsAt: appointmentStartsAt(date, doc.timeSlot).toISOString(),
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
  };
}

export type AppointmentQuery = {
  status?: IAppointment["status"] | IAppointment["status"][];
  patientId?: string;
  from?: DateKey; // dahil
  to?: DateKey; // hariç
  sort?: 1 | -1;
  limit?: number;
};

async function queryAppointments(query: AppointmentQuery): Promise<LeanAppointment[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
  if (query.patientId) filter.patientId = new Types.ObjectId(query.patientId);
  if (query.from || query.to) {
    filter.date = {
      ...(query.from ? { $gte: keyToDate(query.from) } : {}),
      ...(query.to ? { $lt: keyToDate(query.to) } : {}),
    };
  }
  const sort = query.sort ?? 1;
  let q = Appointment.find(filter)
    .sort({ date: sort, timeSlot: sort })
    .populate<{ patientId: PopulatedPatient | null }>("patientId", "name email phone");
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

/* ---------- Çalışma saatleri ve kapalı günler ---------- */

export type WorkingDay = { dayOfWeek: number; slots: string[]; isDayOff: boolean };

/** 7 günün tamamını döndürür; kaydı olmayan gün kapalı kabul edilir */
export async function getWorkingHours(): Promise<WorkingDay[]> {
  await connectDB();
  const docs = await WorkingHours.find().lean();
  return Array.from({ length: 7 }, (_, day) => {
    const doc = docs.find((d) => d.dayOfWeek === day);
    return {
      dayOfWeek: day,
      slots: doc ? [...doc.slots].sort() : [],
      isDayOff: doc ? doc.isDayOff : true,
    };
  });
}

export type ClosedDayDTO = { id: string; date: DateKey; reason: string };

export async function getClosedDays(from?: DateKey, to?: DateKey): Promise<ClosedDayDTO[]> {
  await connectDB();
  const filter =
    from || to
      ? { date: { ...(from ? { $gte: keyToDate(from) } : {}), ...(to ? { $lte: keyToDate(to) } : {}) } }
      : {};
  const docs = await ClosedDay.find(filter).sort({ date: 1 }).lean();
  return docs.map((d) => ({ id: d._id.toString(), date: dateToKey(d.date), reason: d.reason ?? "" }));
}

export function isBookableDate(key: DateKey, now = new Date()): boolean {
  const today = todayKey(now);
  return key >= today && key <= addDays(today, BOOKING_WINDOW_DAYS);
}

type SlotOptions = {
  now?: Date;
  /** Admin: 60 günlük sınır uygulanmaz */
  admin?: boolean;
  /** Ertelemede randevunun kendi slotu dolu sayılmaz */
  excludeAppointmentId?: string;
};

/**
 * Seçilen gün için boş slot başlangıçlarını döndürür:
 * çalışma saatleri − kapalı gün − mevcut randevular − Google Takvim'deki dolu saatler − geçmiş saatler.
 */
export async function getAvailableSlots(key: DateKey, options: SlotOptions = {}): Promise<string[]> {
  const now = options.now ?? new Date();
  if (options.admin ? key < todayKey(now) : !isBookableDate(key, now)) return [];

  await connectDB();
  const [config, closed] = await Promise.all([
    WorkingHours.findOne({ dayOfWeek: dayOfWeek(key) }).lean(),
    ClosedDay.exists({ date: keyToDate(key) }),
  ]);
  if (closed || !config || config.isDayOff || config.slots.length === 0) return [];

  const bookedFilter: Record<string, unknown> = {
    date: keyToDate(key),
    status: { $in: [...SLOT_BLOCKING_STATUSES] },
  };
  if (options.excludeAppointmentId) bookedFilter._id = { $ne: new Types.ObjectId(options.excludeAppointmentId) };

  const [booked, busy] = await Promise.all([
    Appointment.find(bookedFilter).select("timeSlot").lean(),
    getBusyIntervals(appointmentStartsAt(key, "00:00"), appointmentStartsAt(addDays(key, 1), "00:00")),
  ]);
  // Randevular zaman aralığı olarak karşılaştırılır (özel saatli randevular komşu slotları da kapatır)
  const bookedIntervals = booked.map((b) => slotInterval(key, b.timeSlot));

  return [...config.slots].sort().filter((start) => {
    const { start: slotStart, end: slotEnd } = slotInterval(key, start);
    if (slotStart <= now) return false;
    if (bookedIntervals.some((b) => overlaps(b, { start: slotStart, end: slotEnd }))) return false;
    // Google Takvim'de çakışan etkinlik varsa saat kapalı
    return !busy.some((b) => overlaps(b, { start: slotStart, end: slotEnd }));
  });
}

type Interval = { start: Date; end: Date };

function slotInterval(key: DateKey, timeSlotOrStart: string): Interval {
  const start = appointmentStartsAt(key, timeSlotOrStart);
  return { start, end: new Date(start.getTime() + SLOT_DURATION_MINUTES * 60_000) };
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start;
}

/** Verilen saat aralığı başka bir aktif randevuyla çakışıyor mu (admin çalışma saati dışı ekleme için) */
export async function isSlotTaken(key: DateKey, timeSlot: string, excludeAppointmentId?: string): Promise<boolean> {
  await connectDB();
  const filter: Record<string, unknown> = {
    date: keyToDate(key),
    status: { $in: [...SLOT_BLOCKING_STATUSES] },
  };
  if (excludeAppointmentId) filter._id = { $ne: new Types.ObjectId(excludeAppointmentId) };
  const sameDay = await Appointment.find(filter).select("timeSlot").lean();
  const wanted = slotInterval(key, timeSlot);
  return sameDay.some((a) => overlaps(slotInterval(key, a.timeSlot), wanted));
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
    const start = appointmentStartsAt(date, doc.timeSlot);
    const patient = doc.patientId;
    // Gizlilik: hastanın kendi yazdığı not (sağlık bilgisi içerebilir) takvime aktarılmaz
    const eventId = await upsertCalendarEvent(
      {
        appointmentId: doc._id.toString(),
        summary: `${patient?.name ?? "Hasta"} – ${doc.serviceName}`,
        description: [
          `Hizmet: ${doc.serviceName}`,
          patient?.phone ? `Telefon: ${patient.phone}` : null,
          doc.source === "admin" ? "Klinikten oluşturuldu" : "Online randevu",
          `Panel: ${siteConfig.url.replace(/\/$/, "")}/admin/takvim?tarih=${date}`,
        ]
          .filter(Boolean)
          .join("\n"),
        start,
        end: new Date(start.getTime() + SLOT_DURATION_MINUTES * 60_000),
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
