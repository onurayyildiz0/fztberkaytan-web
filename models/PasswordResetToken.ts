import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IPasswordResetToken {
  userId: Types.ObjectId;
  /** Token'ın kendisi değil SHA-256 özeti saklanır */
  tokenHash: string;
  expiresAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // TTL: süresi dolan token'lar MongoDB tarafından otomatik silinir
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { versionKey: false },
);

const PasswordResetToken: Model<IPasswordResetToken> =
  (models.PasswordResetToken as Model<IPasswordResetToken> | undefined) ??
  model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema, "passwordresettokens");

export default PasswordResetToken;
