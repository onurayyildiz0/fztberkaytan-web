import { signOut } from "@/auth";
import SignOutSubmit from "@/components/auth/SignOutSubmit";

const VARIANTS = {
  default:
    "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700",
  sidebar:
    "flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-teal-50/85 transition hover:bg-white/10 hover:text-white",
} as const;

export default function SignOutButton({ variant = "default" }: { variant?: keyof typeof VARIANTS }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <SignOutSubmit label={variant === "sidebar" ? "Oturumu Kapat" : "Çıkış Yap"} className={VARIANTS[variant]} />
    </form>
  );
}
