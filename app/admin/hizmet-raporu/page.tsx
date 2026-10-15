import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Hizmet Raporu" };

export default function Page() {
  return (
    <ComingSoon
      title="Hizmet Raporu"
      description="Hizmet bazında seans ve gelir dağılımı."
      icon={ClipboardList}
      features={["Hizmet bazında seans sayıları", "Hizmet bazında gelir", "Dönem karşılaştırması", "En çok tercih edilen hizmetler"]}
    />
  );
}
