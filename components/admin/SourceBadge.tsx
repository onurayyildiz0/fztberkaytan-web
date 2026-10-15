import { Globe, Stethoscope } from "lucide-react";

/** Hasta kartının türü: siteden hesap açmış mı, yoksa klinikte mi eklenmiş */
export default function SourceBadge({ source, hasAccount }: { source: "online" | "clinic"; hasAccount: boolean }) {
  return hasAccount ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-teal-200">
      <Globe className="size-3" aria-hidden="true" /> Online hesap
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      <Stethoscope className="size-3" aria-hidden="true" /> {source === "clinic" ? "Klinik kaydı" : "Hesapsız"}
    </span>
  );
}
