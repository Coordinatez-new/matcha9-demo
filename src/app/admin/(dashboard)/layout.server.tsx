import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { requireAdmin } from "@/server/auth";
import { orderStats } from "@/server/orders";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const stats = await orderStats();
  return (
    <DashboardShell
      email={admin.email}
      openOrders={stats.received + stats.preparing + stats.ready}
      signOut={logoutAction}
    >
      {children}
    </DashboardShell>
  );
}
