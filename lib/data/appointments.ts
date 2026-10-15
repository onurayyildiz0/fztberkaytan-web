import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  SLOT_BLOCKING_STATUSES,
  BOOKING_WINDOW_DAYS,
  SLOT_DURATION_MINUTES,
  type AppointmentDTO,
} from "@/lib/appointments";
import {
  addDays,
  dateToKey,
  dayOfWeek,
  keyToDate,
  nowMinutes,
  slotLabel,
  timeToMinutes,
  todayKey,
  type DateKey,
} from "@/lib/dates";
import Appointment, { type IAppointment } from "@/models/Appointment";
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
  return {
    id: doc._id.toString(),
    serviceName: doc.serviceName,
    date: dateToKey(doc.date),
    timeSlot: doc.timeSlot,
    status: doc.status,
    notes: doc.notes ?? "",
    createdAt: doc.createdAt.toISOString(),
    patient: isPopulated(p)
      ? { id: p._id.toString(), name: p.name, email: p.email ?? null, phone: p.phone ?? null }
      : null,
  };
}

export type AppointmentQuery = {
  status?: IAppointment["status"];
  patientId?: string;
  from?: DateKey; // dahil
  to?: DateKey; // hariç
  sort?: 1 | -1;
  limit?: number;
};

export async function findAppointments(query: AppointmentQuery = {}): Promise<AppointmentDTO[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
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
  const docs = (await q.lean()) as unknown as LeanAppointment[];
  return docs.map(toAppointmentDTO);
}

/* ---------- Çalışma saatleri ---------- */

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

export function isBookableDate(key: DateKey, now = new Date()): boolean {
  const today = todayKey(now);
  return key >= today && key <= addDays(today, BOOKING_WINDOW_DAYS);
}

/**
 * Seçilen gün için boş slot başlangıçlarını döndürür:
 * çalışma saatleri − aktif randevular − (bugünse) geçmiş saatler.
 */
export async function getAvailableSlots(key: DateKey, now = new Date()): Promise<string[]> {
  if (!isBookableDate(key, now)) return [];

  await connectDB();
  const config = await WorkingHours.findOne({ dayOfWeek: dayOfWeek(key) }).lean();
  if (!config || config.isDayOff || config.slots.length === 0) return [];

  const booked = await Appointment.find({
    date: keyToDate(key),
    status: { $in: [...SLOT_BLOCKING_STATUSES] },
  })
    .select("timeSlot")
    .lean();
  const bookedLabels = new Set(booked.map((b) => b.timeSlot));

  const isToday = key === todayKey(now);
  const currentMinutes = nowMinutes(now);

  return [...config.slots]
    .sort()
    .filter((start) => !bookedLabels.has(slotLabel(start, SLOT_DURATION_MINUTES)))
    .filter((start) => !isToday || timeToMinutes(start) > currentMinutes);
}
