"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, LoaderCircle, X } from "lucide-react";
import { formatDateLong } from "@/lib/dates";

/** Fizyoterapistin önerdiği yeni tarihi kabul / ret */
export default function ProposalActions({
  appointmentId,
  proposal,
}: {
  appointmentId: string;
  proposal: { date: string; timeSlot: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function answer(action: "accept" | "decline") {
    if (action === "decline" && !confirmDecline) return setConfirmDecline(true);
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/appointments/${appointmentId}/proposal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { message?: string } | undefined;
    setLoading(null);
    setConfirmDecline(false);
    if (!res?.ok) return setError(data?.message ?? "İşlem yapılamadı.");
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <p className="flex items-start gap-2 text-sm text-amber-900">
        <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Fizyoterapist bu randevu için yeni bir tarih önerdi:{" "}
          <strong>
            {formatDateLong(proposal.date)} · {proposal.timeSlot}
          </strong>
          . Yeni tarih ancak sizin onayınızla kesinleşir; kabul etmek zorunda değilsiniz.
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => answer("accept")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {loading === "accept" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
          Yeni tarihi kabul et
        </button>
        <button
          type="button"
          onClick={() => answer("decline")}
          onBlur={() => setConfirmDecline(false)}
          disabled={loading !== null}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
            confirmDecline ? "bg-red-600 text-white" : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          {loading === "decline" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
          {confirmDecline ? "Reddet (randevu iptal olur)" : "Reddet"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
