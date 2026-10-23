import { Schema, model, models, type Model } from "mongoose";

/** Haftalık çalışma saatlerinden bağımsız olarak kapalı olan tarih (tatil, izin, kongre vb.) */
export interface IClosedDay {
  /** Takvim günü, UTC gece yarısı (bkz. lib/dates.ts) */
  date: Date;
  reason: string;
  createdAt: Date;
}

const ClosedDaySchema = new Schema<IClosedDay>(
  {
    date: { type: Date, required: true, unique: true },
    reason: { type: String, trim: true, maxlength: 120, default: "" },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { versionKey: false },
);

const ClosedDay: Model<IClosedDay> =
  (models.ClosedDay as Model<IClosedDay> | undefined) ?? model<IClosedDay>("ClosedDay", ClosedDaySchema, "closeddays");

export default ClosedDay;
