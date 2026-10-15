import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Admin sayfalarının ortak başlığı (görseldeki "KLİNİK YÖNETİMİ / Genel Bakış" düzeni) */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold tracking-[0.2em] text-teal-700 uppercase">{eyebrow}</p>}
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1.5 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  teal: { icon: "bg-teal-50 text-teal-700", value: "text-slate-900" },
  red: { icon: "bg-red-50 text-red-600", value: "text-red-600" },
  amber: { icon: "bg-amber-50 text-amber-600", value: "text-amber-600" },
  violet: { icon: "bg-violet-50 text-violet-600", value: "text-violet-700" },
  slate: { icon: "bg-slate-100 text-slate-600", value: "text-slate-900" },
} as const;

export type KpiTone = keyof typeof TONES;

/** Genel Bakış KPI kartı. `pending` true ise modül henüz hazır değildir. */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "teal",
  pending = false,
  href,
}: {
  label: string;
  value?: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  pending?: boolean;
  href?: string;
}) {
  const t = TONES[tone];
  const content = (
    <div className="flex items-start gap-4">
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${pending ? "bg-slate-100 text-slate-400" : t.icon}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        {pending ? (
          <>
            <p className="mt-1 text-2xl font-bold text-slate-300">—</p>
            <p className="mt-1 text-xs text-slate-400">Modül hazırlanıyor</p>
          </>
        ) : (
          <>
            <p className={`mt-1 text-3xl font-bold tabular-nums ${t.value}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
          </>
        )}
      </div>
    </div>
  );

  const className = `block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${
    pending ? "opacity-80" : href ? "transition hover:-translate-y-0.5 hover:shadow-md hover:ring-teal-200" : ""
  }`;

  return href && !pending ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
