import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";

export const PATIENT_SOURCES = ["online", "clinic"] as const;
export type PatientSource = (typeof PATIENT_SOURCES)[number];

/**
 * Hasta kartı. Giriş hesabından (User) bağımsızdır:
 * - Siteden kayıt olan hastanın kartı hesabına bağlıdır (userId dolu, source: "online").
 * - Fizyoterapistin eklediği hastanın hesabı olmayabilir (userId boş, source: "clinic").
 * Randevular, ödemeler ve belgeler her zaman bu karta bağlanır.
 */
export interface IPatient {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
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
