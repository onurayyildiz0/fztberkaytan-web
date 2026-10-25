import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import { GENDERS, type Gender } from "@/lib/validations/patients";

export const PATIENT_SOURCES = ["online", "clinic"] as const;
export type PatientSource = (typeof PATIENT_SOURCES)[number];

/**
 * Hasta kartı. Giriş hesabından (User) bağımsızdır:
 * - Siteden kayıt olan hastanın kartı hesabına bağlıdır (userId dolu, source: "online").
 * - Fizyoterapistin eklediği hastanın hesabı olmayabilir (userId boş, source: "clinic").
 * Randevular, ödemeler ve belgeler her zaman bu karta bağlanır.
 * Klinik alanlar (TC, şikâyet, bulgu vb.) yalnızca yönetim panelinde görünür.
 */
export interface IPatient {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  tcNo?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  complaint?: string;
  findings?: string;
  referringPhysician?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  userId?: Types.ObjectId;
  source: PatientSource;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<IPatient>;

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    notes: { type: String, trim: true, maxlength: 2000 },
    // TC kimlik no: tekrar eden kart açılmasın diye benzersiz (boş kartlarda alan yazılmaz)
    tcNo: { type: String, trim: true, match: /^[1-9]\d{10}$/, unique: true, sparse: true },
    birthDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    gender: { type: String, enum: GENDERS },
    complaint: { type: String, trim: true, maxlength: 2000 },
    findings: { type: String, trim: true, maxlength: 4000 },
    referringPhysician: { type: String, trim: true, maxlength: 150 },
    emergencyContactName: { type: String, trim: true, maxlength: 100 },
    emergencyContactPhone: { type: String, trim: true, maxlength: 30 },
    // Her hesabın en fazla bir kartı olabilir; hesabı olmayan kartlarda alan hiç yazılmaz
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    source: { type: String, enum: PATIENT_SOURCES, required: true, default: "clinic" },
  },
  { versionKey: false, timestamps: true },
);

PatientSchema.index({ name: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ phone: 1 });

const Patient: Model<IPatient> =
  (models.Patient as Model<IPatient> | undefined) ?? model<IPatient>("Patient", PatientSchema);

export default Patient;
