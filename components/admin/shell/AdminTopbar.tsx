import Link from "next/link";
import { Plus, Search } from "lucide-react";

type AdminTopbarProps = {
  userName: string;
  userInitials: string;
};

export default function AdminTopbar({ userName, userInitials }: AdminTopbarProps) {
  return (
    <header className="sticky top-14 z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:top-0">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <p className="hidden shrink-0 font-semibold text-slate-900 xl:block">
          Fzt. Berkay Tan <span className="text-slate-400">·</span> <span className="text-teal-700">Klinik Paneli</span>
        </p>

        <form action="/admin/hastalar" role="search" className="relative ml-auto w-full max-w-md">
          <label htmlFor="global-hasta-ara" className="sr-only">
            Hasta ara
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="global-hasta-ara"
            name="q"
            type="search"
            placeholder="Hasta ara (ad, telefon, e-posta)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-sm transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
          />
        </form>

        <Link
          href="/admin/hastalar/yeni"
          title="Yeni Hasta"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm transition hover:bg-teal-800"
        >
          <Plus className="size-5" aria-hidden="true" />
          <span className="sr-only">Yeni Hasta</span>
        </Link>

        <div className="hidden shrink-0 items-center gap-3 border-l border-slate-200 pl-4 md:flex">
          <span className="text-right leading-tight">
            <span className="block text-sm font-semibold text-slate-900">{userName}</span>
            <span className="block text-xs text-slate-500">Fizyoterapist</span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800 ring-1 ring-teal-100">
            {userInitials}
          </span>
        </div>
      </div>
    </header>
  );
}
