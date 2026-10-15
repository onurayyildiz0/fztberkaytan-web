import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Search, UserPlus, UserX } from "lucide-react";
import SourceBadge from "@/components/admin/SourceBadge";
import { AdminPageHeader } from "@/components/admin/ui";
import { Card, EmptyState } from "@/components/panel/ui";
import { requireAdminPage } from "@/lib/auth/guards";
import { searchPatients } from "@/lib/data/patients";
import { formatTimestamp } from "@/lib/dates";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export const metadata: Metadata = { title: "Hasta Listesi" };
export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? "";

  const patients = await searchPatients(q);
  await connectDB();
  const counts = await Appointment.aggregate<{ _id: unknown; total: number }>([
    { $match: { patientId: { $in: patients.map((p) => p._id) } } },
    { $group: { _id: "$patientId", total: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.total]));

  return (
    <>
      <AdminPageHeader
        eyebrow="Hastalar"
        title="Hasta Listesi"
        description={q ? `"${q}" için ${patients.length} sonuç` : `${patients.length} hasta kartı`}
        actions={
          <Link
            href="/admin/hastalar/yeni"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <UserPlus className="size-4" aria-hidden="true" /> Yeni Hasta
          </Link>
        }
      />

      <form action="/admin/hastalar" className="mb-6 flex max-w-md gap-2">
        <label htmlFor="q" className="sr-only">
          Hasta ara
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Ad, e-posta veya telefon ile ara"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Search className="size-4" aria-hidden="true" /> Ara
        </button>
      </form>

      <Card>
        {patients.length === 0 ? (
          <EmptyState
            icon={UserX}
            title={q ? "Eşleşen hasta bulunamadı" : "Henüz hasta kaydı yok"}
            description={
              q
                ? "Farklı bir arama terimi deneyin veya yeni hasta ekleyin."
                : "Online kayıt olan hastalar ve sizin eklediğiniz hastalar burada listelenir."
            }
            action={
              <Link
                href="/admin/hastalar/yeni"
                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <UserPlus className="size-4" aria-hidden="true" /> Yeni Hasta Ekle
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Ad Soyad</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Telefon</th>
                  <th scope="col" className="px-5 py-3 font-semibold">E-posta</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Kayıt Türü</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Eklenme</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Randevu</th>
                  <th scope="col" className="px-2 py-3"><span className="sr-only">Detay</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const id = p._id.toString();
                  return (
                    <tr key={id} className="group relative hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <Link href={`/admin/hastalar/${id}`} className="after:absolute after:inset-0">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{p.phone || "-"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{p.email || "-"}</td>
                      <td className="px-5 py-3.5">
                        <SourceBadge source={p.source} hasAccount={!!p.userId} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatTimestamp(p.createdAt.toISOString())}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        {countMap.get(id) ?? 0}
                      </td>
                      <td className="px-2 py-3.5 text-slate-400 group-hover:text-teal-700">
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
