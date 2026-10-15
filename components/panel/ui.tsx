import type { LucideIcon } from "lucide-react";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, type AppointmentStatus } from "@/lib/appointments";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ${STATUS_BADGE_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>{children}</div>;
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "slate";
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <span className={`flex size-11 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
