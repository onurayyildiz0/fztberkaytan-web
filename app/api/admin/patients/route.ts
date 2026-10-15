import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { jsonError, readJson } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { toFieldErrors } from "@/lib/validations/auth";
import { patientSchema } from "@/lib/validations/patients";
import Patient from "@/models/Patient";

export const runtime = "nodejs";

/** POST /api/admin/patients → fizyoterapist yeni hasta kartı oluşturur (hesapsız hasta) */
export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = patientSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonError("Lütfen form alanlarını kontrol edin.", 400, { errors: toFieldErrors(parsed.error) });
  }
  const data = parsed.data;

  try {
    await connectDB();

    // Aynı e-postayla kart varsa tekrar oluşturma; mevcut karta yönlendir
    if (data.email) {
      const existing = await Patient.findOne({ email: data.email }).select("_id name").lean();
      if (existing) {
        return jsonError(`Bu e-posta adresiyle kayıtlı bir hasta var: ${existing.name}`, 409, {
          errors: { email: "Bu e-posta başka bir hastaya ait." },
          existingId: existing._id.toString(),
        });
      }
    }

    const patient = await Patient.create({ ...data, source: "clinic" });
    return NextResponse.json({ message: "Hasta kaydedildi.", id: patient._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[admin:patients:create]", err);
    return jsonError("Hasta kaydedilirken bir hata oluştu.", 500);
  }
}
