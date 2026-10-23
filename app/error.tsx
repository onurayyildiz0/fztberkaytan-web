"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

/** Beklenmeyen hata sayfası (hata ayrıntısı kullanıcıya gösterilmez) */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Bir sorun oluştu</h1>
        <p className="mt-2 text-sm text-slate-600">
          İşleminiz şu anda tamamlanamadı. Lütfen tekrar deneyin; sorun devam ederse bizi telefonla arayabilirsiniz.
        </p>
        {error.digest && <p className="mt-2 text-xs text-slate-400">Hata kodu: {error.digest}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Tekrar Dene
          </button>
          <Link href="/" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Anasayfa
          </Link>
        </div>
      </div>
    </main>
  );
}
