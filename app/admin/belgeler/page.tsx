import type { Metadata } from "next";
import { FileText } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Belgeler" };

export default function Page() {
  return (
    <ComingSoon
      title="Belgeler"
      description="Hasta belgeleri, onam formları ve raporların yönetimi."
      icon={FileText}
      features={["Hasta bazlı belge yükleme", "Onam ve KVKK formları", "Eksik evrak takibi", "Doktor raporu / reçete arşivi"]}
    />
  );
}
