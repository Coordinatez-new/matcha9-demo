import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { OverviewView } from "@/components/admin/views/OverviewView";
import { requireAdmin } from "@/server/auth";
import { getAdminMenu } from "@/server/menu";
import { listRecentOrders, orderStats } from "@/server/orders";
import { getSettings } from "@/server/settings";
import { toastConnection } from "@/server/toast";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  await requireAdmin();
  const [stats, settings, menu, recent] = await Promise.all([
    orderStats(),
    getSettings(),
    getAdminMenu(),
    listRecentOrders(6),
  ]);
  return (
    <OverviewView
      stats={stats}
      settings={settings}
      items={menu.items}
      recent={recent}
      toast={toastConnection()}
      now={new Date()}
      actions={{
        setItemFlag: admin.setItemFlagAction,
        setOrderingMode: admin.setOrderingModeAction,
      }}
    />
  );
}
