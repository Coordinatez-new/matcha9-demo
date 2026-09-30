import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { OrdersView } from "@/components/admin/views/OrdersView";
import { requireAdmin } from "@/server/auth";
import { listClosedOrdersToday, listOpenOrders } from "@/server/orders";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  await requireAdmin();
  const [open, closed] = await Promise.all([listOpenOrders(), listClosedOrdersToday()]);
  return (
    <OrdersView
      open={open}
      closed={closed}
      now={new Date()}
      actions={{ setOrderStatus: admin.setOrderStatusAction, retryToast: admin.retryToastAction }}
    />
  );
}
