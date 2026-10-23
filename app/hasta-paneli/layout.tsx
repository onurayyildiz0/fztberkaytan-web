import type { Metadata } from "next";
import PanelShell from "@/components/panel/PanelShell";
import type { PanelNavItem } from "@/components/panel/PanelSidebar";
import { requirePatientPage } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: { default: "Hasta Paneli", template: "%s | Hasta Paneli" },
  robots: { index: false, follow: false },
};

const NAV: PanelNavItem[] = [
  { href: "/hasta-paneli", label: "Panel Özeti", icon: "dashboard", exact: true },
  { href: "/hasta-paneli/hizmetler", label: "Hizmetler & Fiyatlar", icon: "services" },
  { href: "/hasta-paneli/randevu-al", label: "Randevu Al", icon: "book" },
  { href: "/hasta-paneli/randevularim", label: "Randevularım", icon: "myAppointments" },
  { href: "/hasta-paneli/hesabim", label: "Hesabım", icon: "account" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePatientPage();

  return (
    <PanelShell
      title="Hasta Paneli"
      userName={session.user.name ?? "Hasta"}
      userEmail={session.user.email ?? ""}
      items={NAV}
    >
      {children}
    </PanelShell>
  );
}
