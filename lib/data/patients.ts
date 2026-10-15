import "server-only";
import { Types } from "mongoose";
import { isDuplicateKeyError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Patient, { type IPatient } from "@/models/Patient";
import User from "@/models/User";

export type LeanPatient = IPatient & { _id: Types.ObjectId };

export type PatientDTO = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string;
  source: IPatient["source"];
  hasAccount: boolean;
  createdAt: string;
};

export function toPatientDTO(p: LeanPatient): PatientDTO {
  return {
    id: p._id.toString(),
    name: p.name,
    phone: p.phone ?? null,
    email: p.email ?? null,
    notes: p.notes ?? "",
    source: p.source,
    hasAccount: !!p.userId,
    createdAt: p.createdAt.toISOString(),
  };
}

/**
 * Giriş yapan hastanın kartını döndürür; yoksa oluşturur.
 *
 * - Fizyoterapistin daha önce aynı e-postayla eklediği (hesapsız) tek bir kart varsa
 *   yeni kart açmak yerine o karta bağlanır. Hesap e-postası doğrulanmış olduğundan bu güvenlidir.
 * - Eski yapıdan kalan, doğrudan hesaba bağlı randevular karta taşınır.
 */
export async function ensurePatientForUser(userId: string): Promise<LeanPatient | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const existing = await Patient.findOne({ userId: uid }).lean<LeanPatient>();
  if (existing) return existing;

  const user = await User.findById(uid).select("name email phone emailVerified").lean();
  if (!user) return null;

  let patient: LeanPatient | null = null;

  const candidates = await Patient.find({ userId: null, email: user.email }).limit(2).lean<LeanPatient[]>();
  if (candidates.length === 1 && user.emailVerified) {
    patient = await Patient.findOneAndUpdate(
      { _id: candidates[0]._id, userId: null },
      { $set: { userId: uid } },
      { new: true },
    ).lean<LeanPatient>();
    if (patient && !patient.phone && user.phone) {
      await Patient.updateOne({ _id: patient._id }, { $set: { phone: user.phone } });
      patient.phone = user.phone;
    }
  }

  if (!patient) {
    try {
      const created = await Patient.create({
        userId: uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        source: "online",
      });
      patient = created.toObject() as LeanPatient;
    } catch (error) {
      // Eşzamanlı iki istek: diğeri kartı oluşturdu
      if (!isDuplicateKeyError(error)) throw error;
      patient = await Patient.findOne({ userId: uid }).lean<LeanPatient>();
    }
  }

  if (patient) {
    // Eski yapı: randevular doğrudan hesap id'sine bağlıydı
    await Appointment.updateMany({ patientId: uid }, { $set: { patientId: patient._id } });
  }
  return patient;
}

export async function getPatient(id: string): Promise<LeanPatient | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Patient.findById(id).lean<LeanPatient>();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchPatients(q: string, limit = 500): Promise<LeanPatient[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  const term = q.trim().slice(0, 100);
  if (term) {
    const re = new RegExp(escapeRegex(term), "i");
    // Telefon aramasında boşlukları yok say: "0536 111" ile "0536111" eşleşsin
    const digits = term.replace(/\D/g, "");
    filter.$or = [
      { name: re },
      { email: re },
      { phone: re },
      ...(digits.length >= 3 ? [{ phone: new RegExp(digits.split("").join("\\s*")) }] : []),
    ];
  }
  return Patient.find(filter).sort({ createdAt: -1 }).limit(limit).lean<LeanPatient[]>();
}
