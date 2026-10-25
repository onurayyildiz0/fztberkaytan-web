import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { searchPatients } from "@/lib/data/patients";
import { isDuplicateKeyError, jsonError, readJson } from "@/lib/http";
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

    if (data.tcNo) {
      const sameTc = await Patient.findOne({ tcNo: data.tcNo }).select("_id name").lean();
      if (sameTc) {
        return jsonError(`Bu T.C. kimlik numarasıyla kayıtlı bir hasta var: ${sameTc.name}`, 409, {
          errors: { tcNo: "Bu T.C. kimlik numarası başka bir hastaya ait." },
          existingId: sameTc._id.toString(),
        });
      }
    }

    const patient = await Patient.create({ ...data, source: "clinic" });
    return NextResponse.json({ message: "Hasta kaydedildi.", id: patient._id.toString() }, { status: 201 });
  } catch (err) {
    if (isDuplicateKeyError(err)) return jsonError("Bu T.C. kimlik numarası başka bir hastaya ait.", 409, { errors: { tcNo: "Zaten kayıtlı." } });
    console.error("[admin:patients:create]", err);
    return jsonError("Hasta kaydedilirken bir hata oluştu.", 500);
  }
}

/** GET /api/admin/patients?q= → hasta arama (randevu formu için, en fazla 20 sonuç) */
export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const patients = await searchPatients(q, 20);
  return NextResponse.json({
    patients: patients.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      phone: p.phone ?? null,
      email: p.email ?? null,
      hasAccount: !!p.userId,
    })),
  });
}
