import Link from "next/link";
import { ArrowLeft, Hammer, type LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui";

type ComingSoonProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Modülün kapsayacağı başlıca özellikler */
  features: string[];
};

/** Henüz geliştirilmemiş admin modülleri için yer tutucu sayfa */
export default function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <>
      <AdminPageHeader eyebrow="Klinik Yönetimi" title={title} description={description} />
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          <Hammer className="size-3.5" aria-hidden="true" /> Bu modül hazırlanıyor
        </p>
        <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left text-sm text-slate-600 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/admin"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Genel Bakış&apos;a dön
        </Link>
      </div>
    </>
  );
}
