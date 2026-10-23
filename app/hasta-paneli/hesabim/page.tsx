import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { PageHeader } from "@/components/panel/ui";
import AccountSettings from "@/components/patient/AccountSettings";
import { requirePatientWithCardPage } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Hesabım" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { session, patient } = await requirePatientWithCardPage();

  return (
    <>
      <PageHeader title="Hesabım" description="Kişisel bilgilerinizi ve şifrenizi güncelleyin." />
      <SessionProvider session={session}>
        <AccountSettings
          initial={{
            name: patient.name,
            email: session.user.email ?? patient.email ?? "",
            phone: patient.phone ?? "",
          }}
        />
      </SessionProvider>
    </>
  );
}
