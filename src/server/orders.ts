import "server-only";
import { randomBytes } from "node:crypto";
import { connection } from "next/server";
import { resolveSelections, type ImageRef, type SelectedOption } from "@/lib/menu";
import {
  nextStatus,
  orderLimits,
  type BagLineInput,
  type GuestOrder,
  type Order,
  type OrderEvent,
  type OrderLine,
  type OrderStatus,
  type ToastSync,
} from "@/lib/orders";
import { planPickup, startOfStoreDay } from "@/lib/pickup";
import { getDb, type Queryable } from "./db";
import { getItemsByIds } from "./menu";
import { getSettings } from "./settings";
import { sendOrderToToast, toastConnection } from "./toast";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => uuid.test(value);

export type QuotedLine = {
  itemId: string;
  slug: string;
  name: string;
  image: ImageRef | null;
  imageAlt: string;
  selections: SelectedOption[];
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  /** Where the line sits in the guest's bag, so issues can point at it. */
  index: number;
};

export type Quote = {
  lines: QuotedLine[];
  /** Problems with the bag as sent: removed or sold-out drinks, too many items. */
  issues: { index: number; message: string }[];
  subtotalCents: number;
  itemCount: number;
};

/** Price a bag from the current menu. Never trusts names or prices from the browser. */
export async function quoteBag(input: BagLineInput[]): Promise<Quote> {
  const lines = input.slice(0, orderLimits.lines);
  const ids = [...new Set(lines.map((l) => l.itemId).filter(isUuid))];
  const items = new Map((await getItemsByIds(ids)).map((i) => [i.id, i]));

  const quoted: QuotedLine[] = [];
  const issues: Quote["issues"] = [];
  for (const [index, line] of lines.entries()) {
    const item = items.get(line.itemId);
    if (!item || !item.isVisible) {
      issues.push({ index, message: "One of your drinks is no longer on the menu." });
      continue;
    }
    if (!item.inStock) {
      issues.push({ index, message: `${item.name} is sold out right now.` });
      continue;
    }
    const resolved = resolveSelections(item, line.selections ?? {});
    if (!resolved.ok) {
      issues.push({ index, message: resolved.error });
      continue;
    }
    const quantity = Math.min(
      Math.max(Math.floor(Number(line.quantity) || 1), 1),
      orderLimits.quantity,
    );
    quoted.push({
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.productImage ?? item.photoImage,
      imageAlt: item.productImageAlt,
      selections: resolved.selections,
      unitPriceCents: resolved.unitPriceCents,
      quantity,
      lineTotalCents: resolved.unitPriceCents * quantity,
      index,
    });
  }

  const itemCount = quoted.reduce((n, l) => n + l.quantity, 0);
  if (itemCount > orderLimits.items) {
    issues.push({
      index: -1,
      message: `Online orders are limited to ${orderLimits.items} drinks. Call us for bigger orders.`,
    });
  }
  return {
    lines: quoted,
    issues,
    subtotalCents: quoted.reduce((sum, l) => sum + l.lineTotalCents, 0),
    itemCount,
  };
}

export type PlaceOrderInput = {
  lines: BagLineInput[];
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  /** "asap" or the ISO time of one of the offered pickup slots. */
  pickup: string;
};

export type PlaceOrderResult = { ok: true; publicId: string } | { ok: false; error: string };

const token = () => randomBytes(9).toString("base64url");

/** Ticket numbers start here, like a fresh roll of order tickets. */
const FIRST_ORDER_NUMBER = 101;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const settings = await getSettings();
  if (settings.ordering.mode === "paused")
    return { ok: false, error: settings.ordering.pausedMessage };
  if (settings.ordering.mode !== "onsite") {
    return { ok: false, error: "Online orders are being taken on our Toast ordering page." };
  }

  const quote = await quoteBag(input.lines);
  if (quote.issues.length) {
    return { ok: false, error: `${quote.issues[0]!.message} Please check your bag.` };
  }
  if (!quote.lines.length) return { ok: false, error: "Your bag is empty." };

  // Re-derive the pickup times the checkout offered and accept only one of those.
  const plan = planPickup(new Date(), settings.store.hours, settings.ordering);
  let pickupAt: Date;
  const asap = input.pickup === "asap";
  if (asap) {
    if (!plan.asap)
      return { ok: false, error: "ASAP pickup isn’t available now. Please pick a time." };
    pickupAt = new Date(plan.asap.at);
  } else {
    const offered = plan.days.some((d) => d.slots.some((s) => s.at === input.pickup));
    if (!offered) {
      return { ok: false, error: "That pickup time is no longer available. Please pick another." };
    }
    pickupAt = new Date(input.pickup);
  }

  const toastLive = toastConnection().live;
  const db = await getDb();
  const publicId = token();
  const created = await db.transaction(async (tx) => {
    // One order at a time takes the next ticket number, so numbers never skip or repeat.
    await tx.query("select pg_advisory_xact_lock(90910)");
    const [order] = await tx.query<{ id: string; number: number }>(
      `insert into orders (
         number, public_id, customer_name, customer_phone, customer_email, notes, pickup_at,
         pickup_asap, subtotal_cents, item_count, toast_status
       ) values (
         (select coalesce(max(number), ${FIRST_ORDER_NUMBER - 1}) + 1 from orders),
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
       )
       returning id, number`,
      [
        publicId,
        input.name,
        input.phone,
        input.email,
        input.notes,
        pickupAt,
        asap,
        quote.subtotalCents,
        quote.itemCount,
        toastLive ? "pending" : "not_connected",
      ],
    );
    for (const [position, line] of quote.lines.entries()) {
      await tx.query(
        `insert into order_items (
           order_id, menu_item_id, name, options, unit_price_cents, quantity, line_total_cents,
           position
         ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order!.id,
          line.itemId,
          line.name,
          JSON.stringify(line.selections),
          line.unitPriceCents,
          line.quantity,
          line.lineTotalCents,
          position,
        ],
      );
    }
    await tx.query("insert into order_events (order_id, status) values ($1, 'received')", [
      order!.id,
    ]);
    return order!;
  });

  if (toastLive) await forwardToToast(created.id);
  return { ok: true, publicId };
}

/** Send a stored order to Toast and record the outcome on it. */
async function forwardToToast(orderId: string) {
  const db = await getDb();
  const order = (await loadOrders(db, "where o.id = $1", [orderId]))[0];
  if (!order) return;
  const items = new Map(
    (
      await getItemsByIds(order.lines.map((l) => l.menuItemId).filter((id): id is string => !!id))
    ).map((i) => [i.id, i]),
  );
  const result = await sendOrderToToast({
    number: order.number,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    pickupAt: new Date(order.pickupAt),
    asap: order.pickupAsap,
    lines: order.lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      toastGuid: (l.menuItemId && items.get(l.menuItemId)?.toastGuid) || null,
    })),
  });
  await db.query(
    "update orders set toast_status = $1, toast_reference = $2, toast_error = $3, updated_at = now() where id = $4",
    [result.status, result.reference, result.error, orderId],
  );
}

export async function retryToast(orderId: string) {
  if (!toastConnection().live) return;
  await forwardToToast(orderId);
}

type OrderRow = {
  id: string;
  number: number;
  public_id: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  pickup_at: Date | string;
  pickup_asap: boolean;
  subtotal_cents: number;
  item_count: number;
  toast_status: ToastSync;
  toast_reference: string | null;
  toast_error: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type LineRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  options: SelectedOption[];
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

type EventRow = {
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: Date | string;
};

const iso = (value: Date | string) => new Date(value).toISOString();

async function loadOrders(
  db: Queryable,
  where: string,
  params: unknown[] = [],
  orderBy = "o.created_at desc",
  limit = 200,
): Promise<Order[]> {
  const rows = await db.query<OrderRow>(
    `select o.* from orders o ${where} order by ${orderBy} limit ${limit}`,
    params,
  );
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [lines, events] = await Promise.all([
    db.query<LineRow>(
      "select * from order_items where order_id = any($1::uuid[]) order by position asc",
      [ids],
    ),
    db.query<EventRow>(
      "select order_id, status, note, created_at from order_events where order_id = any($1::uuid[]) order by created_at asc, id asc",
      [ids],
    ),
  ]);

  const linesBy = new Map<string, OrderLine[]>();
  for (const l of lines) {
    const list = linesBy.get(l.order_id) ?? [];
    list.push({
      id: l.id,
      menuItemId: l.menu_item_id,
      name: l.name,
      options: l.options ?? [],
      unitPriceCents: l.unit_price_cents,
      quantity: l.quantity,
      lineTotalCents: l.line_total_cents,
    });
    linesBy.set(l.order_id, list);
  }
  const eventsBy = new Map<string, OrderEvent[]>();
  for (const e of events) {
    const list = eventsBy.get(e.order_id) ?? [];
    list.push({ status: e.status, note: e.note, createdAt: iso(e.created_at) });
    eventsBy.set(e.order_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    publicId: r.public_id,
    status: r.status,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    notes: r.notes,
    pickupAt: iso(r.pickup_at),
    pickupAsap: r.pickup_asap,
    subtotalCents: r.subtotal_cents,
    itemCount: r.item_count,
    toastStatus: r.toast_status,
    toastReference: r.toast_reference,
    toastError: r.toast_error,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    lines: linesBy.get(r.id) ?? [],
    events: eventsBy.get(r.id) ?? [],
  }));
}

export async function getGuestOrder(publicId: string): Promise<GuestOrder | null> {
  await connection();
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(publicId)) return null;
  const db = await getDb();
  const order = (await loadOrders(db, "where o.public_id = $1", [publicId]))[0];
  if (!order) return null;
  return {
    number: order.number,
    publicId: order.publicId,
    status: order.status,
    pickupAt: order.pickupAt,
    pickupAsap: order.pickupAsap,
    subtotalCents: order.subtotalCents,
    itemCount: order.itemCount,
    lines: order.lines,
    events: order.events,
    createdAt: order.createdAt,
    notes: order.notes,
    firstName: order.customerName.trim().split(/\s+/)[0] ?? "",
  };
}

/** New, preparing and ready orders, soonest pickup first. */
export async function listOpenOrders() {
  const db = await getDb();
  return loadOrders(
    db,
    "where o.status in ('received', 'preparing', 'ready')",
    [],
    "o.pickup_at asc, o.created_at asc",
  );
}

/** Picked-up and cancelled orders since the start of the store's day. */
export async function listClosedOrdersToday() {
  const db = await getDb();
  return loadOrders(db, "where o.status in ('picked_up', 'cancelled') and o.updated_at >= $1", [
    startOfStoreDay(),
  ]);
}

export async function listRecentOrders(limit = 8) {
  const db = await getDb();
  return loadOrders(db, "", [], "o.created_at desc", limit);
}

export async function getOrder(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  return (await loadOrders(db, "where o.id = $1", [id]))[0] ?? null;
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [row] = await tx.query<{ status: OrderStatus }>(
      "select status from orders where id = $1 for update",
      [id],
    );
    if (!row) return { ok: false as const, error: "Order not found." };
    const allowed =
      nextStatus[row.status] === status ||
      (status === "cancelled" && row.status !== "picked_up" && row.status !== "cancelled");
    if (!allowed) return { ok: false as const, error: "That order has already moved on." };
    await tx.query("update orders set status = $1, updated_at = now() where id = $2", [status, id]);
    await tx.query("insert into order_events (order_id, status) values ($1, $2)", [id, status]);
    return { ok: true as const };
  });
}

export async function orderStats() {
  const db = await getDb();
  const since = startOfStoreDay();
  const [today] = await db.query<{ count: number; sales: number; items: number }>(
    `select count(*)::int as count, coalesce(sum(subtotal_cents), 0)::int as sales,
            coalesce(sum(item_count), 0)::int as items
     from orders where created_at >= $1 and status <> 'cancelled'`,
    [since],
  );
  const open = await db.query<{ status: OrderStatus; count: number }>(
    `select status, count(*)::int as count from orders
     where status in ('received', 'preparing', 'ready') group by status`,
  );
  const byStatus = Object.fromEntries(open.map((r) => [r.status, r.count])) as Partial<
    Record<OrderStatus, number>
  >;
  return {
    todayCount: today?.count ?? 0,
    todaySalesCents: today?.sales ?? 0,
    todayItems: today?.items ?? 0,
    received: byStatus.received ?? 0,
    preparing: byStatus.preparing ?? 0,
    ready: byStatus.ready ?? 0,
  };
}

/** Cheap fingerprint of the open orders, so the dashboard can poll for changes. */
export async function ordersVersion() {
  const db = await getDb();
  const [row] = await db.query<{ version: string | null; open: number; fresh: number }>(
    `select max(updated_at)::text as version,
            count(*) filter (where status in ('received', 'preparing', 'ready'))::int as open,
            count(*) filter (where status = 'received')::int as fresh
     from orders`,
  );
  return row ?? { version: null, open: 0, fresh: 0 };
}
