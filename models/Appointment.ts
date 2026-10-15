import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import { SLOT_BLOCKING_STATUSES, APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/appointments";
import { SERVICE_NAMES, type ServiceName } from "@/lib/services";

export interface IAppointment {
  patientId: Types.ObjectId;
  serviceName: ServiceName;
  /** Takvim günü, UTC gece yarısı olarak (bkz. lib/dates.ts) */
  date: Date;
  /** Ör. "10:00 - 11:00" */
  timeSlot: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: Date;
}

export type AppointmentDocument = HydratedDocument<IAppointment>;

const AppointmentSchema = new Schema<IAppointment>(
  {
    // Hasta kartına (Patient) bağlıdır; giriş hesabına değil
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    serviceName: { type: String, enum: SERVICE_NAMES, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "pending", required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { versionKey: false },
);

AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ status: 1, date: 1 });

// Çifte rezervasyonu veritabanı seviyesinde engeller:
// aynı gün + saat için yalnızca bir bekleyen/onaylı/tamamlanmış randevu olabilir.
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
