import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";
import { ROLES, type Role } from "@/lib/auth/roles";

export interface IUser {
  name: string;
  email: string;
  /** bcrypt hash'i – varsayılan sorgularda dönmez, gerektiğinde .select("+password") ile alınır */
  password: string;
  role: Role;
  phone?: string;
  /** E-posta doğrulandığı an; null ise doğrulanmamış (hasta giriş yapamaz) */
  emailVerified: Date | null;
  /** Kayıtta KVKK aydınlatma + kullanım koşulları onay zamanı ve metin sürümü */
  consentAt?: Date;
  consentVersion?: string;
  createdAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Ad soyad zorunludur."],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "E-posta zorunludur."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur."],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "patient",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    consentAt: { type: Date },
    consentVersion: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

const User: Model<IUser> = (models.User as Model<IUser> | undefined) ?? model<IUser>("User", UserSchema);

export default User;
