import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import {
  APPOINTMENT_SOURCES,
  APPOINTMENT_STATUSES,
  CANCELLED_BY,
  SLOT_BLOCKING_STATUSES,
  type AppointmentSource,
  type AppointmentStatus,
  type CancelledBy,
} from "@/lib/appointments";
import { SERVICE_NAMES, type ServiceName } from "@/lib/services";

export interface IAppointment {
  patientId: Types.ObjectId;
  serviceName: ServiceName;
  /** Alt hizmet (ör. Fizyoterapi → Manuel Terapi) */
  serviceOption?: string | null;
  /** Seans süresi (dakika); eski kayıtlarda 60 */
  durationMinutes: number;
  /** Takvim günü, UTC gece yarısı olarak (bkz. lib/dates.ts) */
  date: Date;
  /** Ör. "10:00 - 11:00" */
  timeSlot: string;
  status: AppointmentStatus;
  /** Hastanın notu */
  notes: string;
  /** Yalnızca fizyoterapistin gördüğü özel not */
  adminNotes: string;
  /** Randevuyu kim oluşturdu: hasta (online) veya fizyoterapist */
  source: AppointmentSource;
  cancelledBy?: CancelledBy;
  /** Hatırlatma e-postası gönderildiyse zamanı (erteleme sonrası sıfırlanır) */
  reminderSentAt?: Date | null;
  /** Google Takvim etkinlik kimliği */
  googleEventId?: string | null;
  /** Fizyoterapistin önerdiği yeni tarih/saat; hasta kabul edince randevu buraya taşınır */
  proposedDate?: Date | null;
  proposedTimeSlot?: string | null;
  proposedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentDocument = HydratedDocument<IAppointment>;

const AppointmentSchema = new Schema<IAppointment>(
  {
    // Hasta kartına (Patient) bağlıdır; giriş hesabına değil
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    serviceName: { type: String, enum: SERVICE_NAMES, required: true },
    serviceOption: { type: String, trim: true, maxlength: 100, default: null },
    durationMinutes: { type: Number, min: 5, max: 480, default: 60 },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "pending", required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    adminNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    source: { type: String, enum: APPOINTMENT_SOURCES, default: "online", required: true },
    cancelledBy: { type: String, enum: CANCELLED_BY },
    reminderSentAt: { type: Date, default: null },
    googleEventId: { type: String, default: null },
    proposedDate: { type: Date, default: null },
    proposedTimeSlot: { type: String, default: null },
    proposedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { versionKey: false, timestamps: { createdAt: false, updatedAt: true } },
);

AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ status: 1, date: 1 });

// Aynı başlangıç saatine çifte kaydı veritabanı seviyesinde engeller.
// Farklı sürelerdeki kısmi çakışmalar uygulamada (lib/data/appointments.ts) kontrol edilir.
AppointmentSchema.index(
  { date: 1, timeSlot: 1 },
  {
    unique: true,
    name: "unique_active_slot",
    partialFilterExpression: { status: { $in: [...SLOT_BLOCKING_STATUSES] } },
  },
);

const Appointment: Model<IAppointment> =
  (models.Appointment as Model<IAppointment> | undefined) ??
  model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
