"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, CheckCheck, LoaderCircle, X, type LucideIcon } from "lucide-react";
import { ADMIN_TRANSITIONS, type AppointmentStatus } from "@/lib/appointments";

const ACTIONS: Partial<
  Record<AppointmentStatus, { label: string; icon: LucideIcon; className: string; confirm?: string }>
> = {
  approved: { label: "Onayla", icon: Check, className: "bg-teal-700 text-white hover:bg-teal-800" },
  rejected: {
    label: "Reddet",
    icon: X,
    className: "border border-red-200 text-red-700 hover:bg-red-50",
    confirm: "Reddetmeyi onayla",
  },
  completed: { label: "Tamamlandı", icon: CheckCheck, className: "bg-slate-800 text-white hover:bg-slate-900" },
  cancelled: {
    label: "İptal Et",
    icon: Ban,
    className: "border border-red-200 text-red-700 hover:bg-red-50",
    confirm: "İptali onayla",
  },
};

type StatusActionsProps = {
  appointmentId: string;
  status: AppointmentStatus;
  onDone?: (status: AppointmentStatus) => void;
};

export default function StatusActions({ appointmentId, status, onDone }: StatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<AppointmentStatus | null>(null);
  const [confirming, setConfirming] = useState<AppointmentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = ADMIN_TRANSITIONS[status];
  if (transitions.length === 0) return null;

  async function update(next: AppointmentStatus) {
    const action = ACTIONS[next];
    // Geri alınamayan işlemler için ikinci tıklama ile onay
    if (action?.confirm && confirming !== next) {
      setConfirming(next);
      return;
    }

    setPending(next);
    setError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "İşlem başarısız oldu.");
        return;
      }
      onDone?.(next);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setPending(null);
      setConfirming(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {transitions.map((next) => {
          const action = ACTIONS[next];
          if (!action) return null;
          const Icon = action.icon;
          const isConfirming = confirming === next;
          return (
            <button
              key={next}
              type="button"
              disabled={pending !== null}
              onClick={(e) => {
                e.stopPropagation();
                void update(next);
              }}
              onBlur={() => isConfirming && setConfirming(null)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
                isConfirming ? "bg-red-600 text-white hover:bg-red-700" : action.className
              }`}
            >
              {pending === next ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Icon className="size-4" aria-hidden="true" />
              )}
              {isConfirming && action.confirm ? action.confirm : action.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
