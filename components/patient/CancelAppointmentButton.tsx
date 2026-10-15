"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, LoaderCircle } from "lucide-react";

export default function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "Randevu iptal edilemedi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">İptal edilsin mi?</span>
          <button
            type="button"
            onClick={cancel}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Evet, iptal et
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Vazgeç
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <Ban className="size-4" aria-hidden="true" />
          İptal Et
        </button>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
