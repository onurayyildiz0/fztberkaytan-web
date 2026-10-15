import { Schema, model, models, type Model } from "mongoose";

export interface IWorkingHours {
  /** 0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi */
  dayOfWeek: number;
  /** Slot başlangıç saatleri, ör. ["09:00", "10:00", "14:00"] */
  slots: string[];
  isDayOff: boolean;
}

const WorkingHoursSchema = new Schema<IWorkingHours>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6, unique: true },
    slots: {
      type: [String],
      default: [],
      validate: {
        validator: (slots: string[]) => slots.every((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s)),
        message: "Slotlar SS:DD biçiminde olmalıdır.",
      },
    },
    isDayOff: { type: Boolean, default: false },
  },
  { versionKey: false },
);

const WorkingHours: Model<IWorkingHours> =
  (models.WorkingHours as Model<IWorkingHours> | undefined) ??
  model<IWorkingHours>("WorkingHours", WorkingHoursSchema, "workinghours");

export default WorkingHours;
