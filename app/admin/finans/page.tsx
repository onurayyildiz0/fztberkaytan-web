import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Finans" };

export default function Page() {
  return (
    <ComingSoon
      title="Finans"
      description="Tahsilat, gider ve kasa yönetimi."
      icon={Wallet}
      features={["Seans ve paket tahsilatları", "Gelir – gider kayıtları", "Sabit giderler", "Borçlu hasta ve ödeme takibi"]}
    />
  );
}
