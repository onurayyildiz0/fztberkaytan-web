import SignOutButton from "@/components/auth/SignOutButton";
import PanelSidebar, { type PanelNavItem } from "@/components/panel/PanelSidebar";

type PanelShellProps = {
  title: string;
  userName: string;
  userEmail: string;
  items: PanelNavItem[];
  children: React.ReactNode;
};

export default function PanelShell({ title, userName, userEmail, items, children }: PanelShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <PanelSidebar
        title={title}
        userName={userName}
        userEmail={userEmail}
        items={items}
        footer={<SignOutButton />}
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
