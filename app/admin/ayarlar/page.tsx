import type { Metadata } from "next";
import { Settings } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return (
    <ComingSoon
      title="Ayarlar"
      description="Klinik, hizmet ve sistem ayarları."
      icon={Settings}
      features={["Klinik ve iletişim bilgileri", "Hizmetler ve fiyatlar", "Bildirim / e-posta ayarları", "Kullanıcı ve güvenlik ayarları"]}
    />
  );
}
