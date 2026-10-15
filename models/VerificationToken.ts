import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IVerificationToken {
  userId: Types.ObjectId;
  /** Token'ın kendisi değil SHA-256 özeti saklanır; veritabanı sızsa bile linkler kullanılamaz */
  tokenHash: string;
  expiresAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // TTL: süresi dolan token'lar MongoDB tarafından otomatik silinir
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { versionKey: false },
);

const VerificationToken: Model<IVerificationToken> =
  (models.VerificationToken as Model<IVerificationToken> | undefined) ??
  model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;
