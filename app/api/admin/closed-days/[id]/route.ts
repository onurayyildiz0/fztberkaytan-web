import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { isObjectId, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import ClosedDay from "@/models/ClosedDay";

export const runtime = "nodejs";

/** DELETE /api/admin/closed-days/:id → kapalı günü tekrar randevuya açar */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("Kayıt bulunamadı.", 404);

  await connectDB();
  const result = await ClosedDay.deleteOne({ _id: id });
  if (result.deletedCount === 0) return jsonError("Kayıt bulunamadı.", 404);
  return NextResponse.json({ message: "Gün tekrar randevuya açıldı." });
}
