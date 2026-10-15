import type { Metadata } from "next";
import { Suspense } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import AdminSidebar from "@/components/admin/shell/AdminSidebar";
import AdminTopbar from "@/components/admin/shell/AdminTopbar";
import { requireAdminPage } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: { default: "Klinik Paneli", template: "%s | Klinik Paneli" },
  robots: { index: false, follow: false },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware'e ek olarak her istekte sunucu tarafında admin doğrulaması
  const session = await requireAdminPage();
  const userName = session.user.name ?? "Fizyoterapist";
  const userInitials = initials(userName) || "FT";

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Suspense>
        <AdminSidebar userName={userName} userInitials={userInitials} signOut={<SignOutButton variant="sidebar" />} />
      </Suspense>
      <div className="min-w-0 flex-1">
        <AdminTopbar userName={userName} userInitials={userInitials} />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
