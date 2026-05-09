import { Sidebar } from "@/components/dashboard/Sidebar";
import { AuthGate } from "@/components/dashboard/AuthGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="relative flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </AuthGate>
  );
}
