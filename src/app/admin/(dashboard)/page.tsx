import Image from "next/image";
import Link from "next/link";
import { setItemFlagAction, setOrderingModeAction } from "@/app/admin/actions";
import { ActionButton, ActionSwitch } from "@/components/admin/controls";
import { Badge, Card, EmptyState, PageHeader, Stat, adminButton } from "@/components/admin/ui";
import { AutoRefresh } from "@/components/order/AutoRefresh";
import { OpenStatus } from "@/components/order/OpenStatus";
import { cn } from "@/lib/cn";
import { formatMoney, toOrderable } from "@/lib/menu";
import { statusCopy } from "@/lib/orders";
import { describeTime, zonedParts } from "@/lib/pickup";
import type { OrderingMode } from "@/lib/settings";
import { STORE_TIME_ZONE } from "@/lib/settings";
import { buildStorefront } from "@/lib/storefront";
import { getAdminMenu } from "@/server/menu";
import { listRecentOrders, orderStats } from "@/server/orders";
import { getSettings } from "@/server/settings";
import { toastConnection } from "@/server/toast";
import { requireAdmin } from "@/server/auth";

const modes: { id: OrderingMode; title: string; body: string }[] = [
  {
    id: "onsite",
    title: "Taking orders here",
    body: "Guests order and check out on this website. Orders arrive on the Orders page.",
  },
  {
    id: "paused",
    title: "Paused",
    body: "Ordering buttons are switched off and guests see your paused message.",
  },
  {
    id: "toast",
    title: "Hand off to Toast",
    body: "Order buttons send guests to your Toast online ordering page instead.",
  },
];

function greeting(now: Date) {
  const hour = zonedParts(now).hour;
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function OverviewPage() {
  await requireAdmin();
  const [stats, settings, menu, recent] = await Promise.all([
    orderStats(),
    getSettings(),
    getAdminMenu(),
    listRecentOrders(6),
  ]);
  const now = new Date();
  const storefront = buildStorefront(settings, menu.items.map(toOrderable), now);
  const toast = toastConnection();
  const onMenu = menu.items.filter((i) => i.isVisible);
  const soldOut = onMenu.filter((i) => !i.inStock).length;
  const today = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <>
      <AutoRefresh every={15000} />
      <PageHeader
        eyebrow={today}
        title={greeting(now)}
        description="Here’s how today is going. Anything you change here shows on the website straight away."
        actions={
          <Link href="/admin/orders" className={adminButton.primary}>
            Open the orders board
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders today" value={stats.todayCount} note="Website pickup orders" />
        <Stat
          label="Sales today"
          value={formatMoney(stats.todaySalesCents)}
          note="Before tax, excluding cancelled"
        />
        <Stat label="Drinks ordered" value={stats.todayItems} />
        <Stat
          label="In progress"
          value={stats.received + stats.preparing + stats.ready}
          note={`${stats.received} new · ${stats.preparing} preparing · ${stats.ready} ready`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <Card
          className="xl:col-span-3"
          title="Online ordering"
          description="Choose how guests order from the website right now."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {modes.map((m) => {
              const active = settings.ordering.mode === m.id;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col rounded-lg border p-4",
                    active ? "border-moss bg-cream" : "border-line",
                  )}
                >
                  <p className="flex items-center gap-2 font-medium text-ink">
                    <span
                      aria-hidden="true"
                      className={cn("size-2 rounded-full", active ? "bg-matcha" : "bg-line")}
                    />
                    {m.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{m.body}</p>
                  <div className="mt-4">
                    {active ? (
                      <Badge tone="dark">Current</Badge>
                    ) : (
                      <ActionButton
                        action={setOrderingModeAction.bind(null, m.id)}
                        pendingLabel="Switching…"
                        variant="secondary"
                        className="px-4 py-1.5"
                      >
                        Switch to this
                      </ActionButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <OpenStatus storefront={storefront} />
            <Link
              href="/admin/settings"
              className="text-sm text-moss underline decoration-moss/30 underline-offset-4"
            >
              Hours and pickup settings
            </Link>
          </div>
        </Card>

        <Card
          className="xl:col-span-2"
          title="Toast POS"
          description="Where the bar rings up and fulfils orders."
        >
          {toast.live ? (
            <div className="space-y-3 text-sm">
              <Badge tone="green">Connected</Badge>
              <p className="text-ink-soft">
                Website orders are sent to Toast ({toast.host}) as soon as they’re placed, so they
                print on the bar like any other order.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed">
              <Badge tone="amber">Demo mode · not connected</Badge>
              <p className="text-ink-soft">
                Orders are saved here and run from the Orders board. Once Toast API access is set
                up, each order is also sent to Toast, and the menu’s Toast item IDs link every drink
                to your POS.
              </p>
              <p className="text-ink-soft">
                Delivery, and the Toast-hosted ordering page, keep working through{" "}
                <a
                  href={settings.toast.onlineOrderingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-moss underline decoration-moss/30 underline-offset-4"
                >
                  your Toast site
                </a>
                .
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card
          className="xl:col-span-3"
          title="Sold out?"
          description={
            soldOut
              ? `${soldOut} of ${onMenu.length} drinks marked sold out. Guests can’t order them.`
              : "Switch a drink off the moment it runs out. Guests see “Sold out today”."
          }
          padded={false}
        >
          <ul className="divide-y divide-line">
            {onMenu.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-cream">
                  {item.productImage && (
                    <Image
                      src={item.productImage.src}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain p-0.5 mix-blend-multiply"
                    />
                  )}
                </div>
                <Link
                  href={`/admin/menu/${item.id}`}
                  className="flex-1 text-sm text-ink hover:text-moss"
                >
                  {item.name}
                </Link>
                <ActionSwitch
                  checked={item.inStock}
                  action={setItemFlagAction.bind(null, item.id, "inStock")}
                  label={`${item.name} in stock`}
                  onLabel="In stock"
                  offLabel="Sold out"
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card
          className="xl:col-span-2"
          title="Latest orders"
          actions={
            <Link
              href="/admin/orders"
              className="text-sm text-moss underline decoration-moss/30 underline-offset-4"
            >
              All orders
            </Link>
          }
          padded={false}
        >
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      <span className="text-moss tabular-nums">#{o.number}</span> {o.customerName}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {describeTime(new Date(o.createdAt), now)} · {formatMoney(o.subtotalCents)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      o.status === "cancelled"
                        ? "red"
                        : o.status === "picked_up"
                          ? "green"
                          : o.status === "received"
                            ? "amber"
                            : "neutral"
                    }
                  >
                    {statusCopy[o.status].label}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <EmptyState title="No orders yet">
                Place a test order from the{" "}
                <Link href="/menu" className="underline">
                  menu
                </Link>{" "}
                and watch it arrive here.
              </EmptyState>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
