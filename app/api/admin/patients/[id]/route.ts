import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { isObjectId, jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { toFieldErrors } from "@/lib/validations/auth";
import { patientSchema } from "@/lib/validations/patients";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";

export const runtime = "nodejs";

/** PATCH /api/admin/patients/:id → hasta kartını günceller */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Hasta bulunamadı.", 404);

  const parsed = patientSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen form alanlarını kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const { name, phone, email, notes } = parsed.data;

  try {
    await connectDB();
    if (email) {
      const other = await Patient.findOne({ email, _id: { $ne: id } }).select("name").lean();
      if (other) {
        return jsonError(`Bu e-posta adresi başka bir hastaya ait: ${other.name}`, 409, {
          errors: { email: "Bu e-posta başka bir hastaya ait." },
        });
      }
    }
    const set: Record<string, string> = { name };
    const unset: Record<string, 1> = {};
    for (const [key, value] of Object.entries({ phone, email, notes })) {
      if (value) set[key] = value;
      else unset[key] = 1;
    }
    const updated = await Patient.findByIdAndUpdate(
      id,
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true },
    ).lean();
    if (!updated) return jsonError("Hasta bulunamadı.", 404);
    return NextResponse.json({ message: "Hasta kartı güncellendi." });
  } catch (err) {
    console.error("[admin:patients:update]", err);
    return jsonError("Hasta kartı güncellenirken bir hata oluştu.", 500);
  }
}

/**
 * DELETE /api/admin/patients/:id → yanlışlıkla açılmış kartları siler.
 * Randevu geçmişi olan (sağlık kaydı saklama yükümlülüğü) veya online hesabı bağlı kartlar silinemez.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Hasta bulunamadı.", 404);

  try {
    await connectDB();
    const patient = await Patient.findById(id).select("userId").lean();
    if (!patient) return jsonError("Hasta bulunamadı.", 404);
    if (patient.userId) {
      return jsonError("Online hesabı olan hastanın kartı silinemez. Hasta hesabını kendi panelinden silebilir.", 409);
    }
    if (await Appointment.exists({ patientId: id })) {
      return jsonError("Randevu geçmişi olan hasta kartı silinemez (sağlık kayıtlarının saklama yükümlülüğü).", 409);
    }
    await Patient.deleteOne({ _id: id });
    return NextResponse.json({ message: "Hasta kartı silindi." });
  } catch (err) {
    console.error("[admin:patients:delete]", err);
    return jsonError("Hasta kartı silinirken bir hata oluştu.", 500);
  }
}
