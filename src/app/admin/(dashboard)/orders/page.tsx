import type { Metadata } from "next";
import { OrderAlerts } from "@/components/admin/OrderAlerts";
import { OrderCard } from "@/components/admin/OrderCard";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { AutoRefresh } from "@/components/order/AutoRefresh";
import { formatMoney } from "@/lib/menu";
import { statusCopy, type OrderStatus } from "@/lib/orders";
import { storeClock } from "@/lib/pickup";
import { listClosedOrdersToday, listOpenOrders } from "@/server/orders";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Orders" };

const columns: { status: OrderStatus; title: string; empty: string }[] = [
  { status: "received", title: "New", empty: "New website orders land here." },
  { status: "preparing", title: "Preparing", empty: "Nothing on the bar right now." },
  { status: "ready", title: "Ready for pickup", empty: "Nothing waiting at the counter." },
];

export default async function OrdersPage() {
  await requireAdmin();
  const [open, closed] = await Promise.all([listOpenOrders(), listClosedOrdersToday()]);
  const now = new Date();
  const latest = Math.max(0, ...open.map((o) => o.number), ...closed.map((o) => o.number));

  return (
    <>
      <AutoRefresh every={5000} />
      <PageHeader
        eyebrow="Live · refreshes every few seconds"
        title="Orders"
        description="Pickup orders from the website, soonest first. Move each one along as you make it; guests see the change on their order page."
        actions={<OrderAlerts latest={latest} />}
      />

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-3">
        {columns.map((col) => {
          const orders = open.filter((o) => o.status === col.status);
          return (
            <section key={col.status} aria-labelledby={`col-${col.status}`}>
              <h2
                id={`col-${col.status}`}
                className="flex items-center gap-3 font-sans text-sm font-semibold text-ink"
              >
                {col.title}
                <Badge tone={orders.length ? "dark" : "neutral"}>{orders.length}</Badge>
              </h2>
              <div className="mt-4 space-y-4">
                {orders.length ? (
                  orders.map((order) => <OrderCard key={order.id} order={order} now={now} />)
                ) : (
                  <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-ink-soft">
                    {col.empty}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-14">
        <h2 className="font-sans text-sm font-semibold text-ink">Finished today</h2>
        {closed.length ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Drinks</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {closed.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3 font-medium text-moss tabular-nums">
                      #{o.number}
                      <span className="block text-xs font-normal text-ink-soft">
                        {storeClock(new Date(o.updatedAt))}
                      </span>
                    </td>
                    <td className="px-5 py-3">{o.customerName}</td>
                    <td className="hidden px-5 py-3 text-ink-soft sm:table-cell">
                      {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={o.status === "cancelled" ? "red" : "green"}>
                        {statusCopy[o.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatMoney(o.subtotalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="Nothing finished yet today">
              Picked-up and cancelled orders from today will be listed here.
            </EmptyState>
          </div>
        )}
      </section>
    </>
  );
}
