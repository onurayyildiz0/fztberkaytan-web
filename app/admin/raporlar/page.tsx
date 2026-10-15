import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Raporlar" };

export default function Page() {
  return (
    <ComingSoon
      title="Raporlar"
      description="Klinik performansı ve dönemsel raporlar."
      icon={BarChart3}
      features={["Aylık randevu ve hasta raporları", "Gelir – gider raporları", "İptal / gelmeme oranları", "Dışa aktarma (Excel/PDF)"]}
    />
  );
}
