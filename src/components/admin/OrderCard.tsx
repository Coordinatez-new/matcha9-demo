import { cn } from "@/lib/cn";
import { describeSelections, formatMoney } from "@/lib/menu";
import { nextStatus, statusCopy, type Order } from "@/lib/orders";
import { describeTime } from "@/lib/pickup";
import { ActionButton } from "./controls";
import type { OrderActions } from "./types";
import { Badge } from "./ui";

function ToastLine({ order, retry }: { order: Order; retry: OrderActions["retryToast"] }) {
  switch (order.toastStatus) {
    case "sent":
      return (
        <Badge tone="green">
          In Toast{order.toastReference ? ` · ${order.toastReference.slice(0, 8)}` : ""}
        </Badge>
      );
    case "pending":
      return <Badge tone="neutral">Sending to Toast…</Badge>;
    case "failed":
      return (
        <div className="space-y-2">
          <Badge tone="red">Not in Toast</Badge>
          {order.toastError && <p className="text-xs text-terracotta-deep">{order.toastError}</p>}
          <ActionButton
            action={retry.bind(null, order.id)}
            pendingLabel="Retrying…"
            variant="ghost"
          >
            Retry sending to Toast
          </ActionButton>
        </div>
      );
    default:
      return <span className="text-xs text-ink-soft">Toast POS not connected · demo</span>;
  }
}

/** One ticket on the orders board. */
export function OrderCard({
  order,
  now,
  actions,
}: {
  order: Order;
  now: Date;
  actions: OrderActions;
}) {
  const pickup = new Date(order.pickupAt);
  const minutes = Math.round((pickup.getTime() - now.getTime()) / 60_000);
  const next = nextStatus[order.status];
  const open = order.status !== "picked_up" && order.status !== "cancelled";
  const due = open && order.status !== "ready" && minutes <= 5;

  return (
    <article
      className={cn(
        "rounded-xl border bg-paper p-5 shadow-[0_1px_0_rgb(31_39_29/0.04)]",
        due ? "border-terracotta/60" : "border-line",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl leading-none text-moss tabular-nums">
            #{order.number}
          </p>
          <p className="mt-2 font-medium text-ink">{order.customerName}</p>
        </div>
        <div className="text-right">
          {order.pickupAsap ? <Badge tone="dark">ASAP</Badge> : <Badge>Scheduled</Badge>}
          <p
            className={cn(
              "mt-2 text-sm tabular-nums",
              due ? "text-terracotta-deep" : "text-ink-soft",
            )}
          >
            {open && minutes < 0 ? `${-minutes} min late` : null}
            {open && minutes >= 0 && minutes <= 90 ? `in ${minutes} min` : null}
            {(!open || minutes > 90) && describeTime(pickup, now)}
          </p>
        </div>
      </header>
      <p className="mt-1 text-xs text-ink-soft">
        Placed {describeTime(new Date(order.createdAt), now).replace(/^Today at /, "at ")}
      </p>

      <ul className="mt-4 space-y-2 border-t border-line pt-4">
        {order.lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-3 text-sm">
            <span>
              <span className="font-semibold text-moss tabular-nums">{line.quantity}×</span>{" "}
              <span className="text-ink">{line.name}</span>
              {line.options.length > 0 && (
                <span className="block pl-6 text-xs text-ink-soft">
                  {describeSelections(line.options)}
                </span>
              )}
            </span>
            <span className="text-ink-soft tabular-nums">{formatMoney(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-3 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-ink">
          <span className="font-semibold text-terracotta-deep">Note:</span> {order.notes}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
        <span className="font-semibold text-ink tabular-nums">
          {formatMoney(order.subtotalCents)}
        </span>
        <a
          href={`tel:${order.customerPhone.replace(/[^\d+]/g, "")}`}
          className="text-ink-soft underline decoration-line underline-offset-4 hover:text-moss"
        >
          {order.customerPhone}
        </a>
      </div>
      <div className="mt-3">
        <ToastLine order={order} retry={actions.retryToast} />
      </div>

      {open && (
        <div className="mt-5 flex items-center justify-between gap-3">
          {next && (
            <ActionButton
              action={actions.setOrderStatus.bind(null, order.id, next)}
              variant="primary"
              pendingLabel="Updating…"
            >
              {statusCopy[next].action}
            </ActionButton>
          )}
          <ActionButton
            action={actions.setOrderStatus.bind(null, order.id, "cancelled")}
            confirm={`Cancel order #${order.number} for ${order.customerName}?`}
            variant="ghost"
          >
            Cancel
          </ActionButton>
        </div>
      )}
    </article>
  );
}
