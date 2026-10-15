import Link from "next/link";
import { Activity } from "lucide-react";
import { siteConfig } from "@/lib/site";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
          <Activity className="size-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-slate-900">{siteConfig.name}</span>
          <span className="text-xs font-medium text-teal-700">{siteConfig.unit}</span>
        </span>
      </Link>

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>

      <div className="mt-6 text-sm text-slate-600">{footer}</div>
    </main>
  );
}
