import { NextResponse } from "next/server";
import { requirePatientWithCardApi } from "@/lib/auth/guards";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { profileSchema, toFieldErrors } from "@/lib/validations/auth";
import Patient from "@/models/Patient";
import User from "@/models/User";

export const runtime = "nodejs";

/** PATCH /api/account/profile { name, phone } → hasta kendi ad/telefonunu günceller (hesap + hasta kartı) */
export async function PATCH(request: Request) {
  const { session, patient, error } = await requirePatientWithCardApi();
  if (error) return error;

  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen bilgilerinizi kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const { name, phone } = parsed.data;

  try {
    await connectDB();
    const update = phone ? { $set: { name, phone } } : { $set: { name }, $unset: { phone: 1 } };
    await Promise.all([User.updateOne({ _id: session.user.id }, update), Patient.updateOne({ _id: patient._id }, update)]);
    return NextResponse.json({ message: "Bilgileriniz güncellendi.", name, phone: phone ?? null });
  } catch (err) {
    console.error("[account:profile]", err);
    return jsonError("Bilgiler güncellenirken bir hata oluştu.", 500);
  }
}
