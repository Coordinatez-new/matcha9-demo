import {
  resolveSelections,
  type ImageRef,
  type MenuItem,
  type SelectedOption,
  type SelectionInput,
} from "./menu";
import { planPickup } from "./pickup";
import type { Settings } from "./settings";

export type OrderStatus = "received" | "preparing" | "ready" | "picked_up" | "cancelled";

/** The happy path, in order. */
export const statusFlow: OrderStatus[] = ["received", "preparing", "ready", "picked_up"];

export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  received: "preparing",
  preparing: "ready",
  ready: "picked_up",
};

export const statusCopy: Record<
  OrderStatus,
  { label: string; action: string; guestTitle: string; guestDetail: string }
> = {
  received: {
    label: "New",
    action: "Mark new",
    guestTitle: "We’ve got your order",
    guestDetail: "The bar has it and will start whisking shortly.",
  },
  preparing: {
    label: "Preparing",
    action: "Start preparing",
    guestTitle: "Your matcha is being whisked",
    guestDetail: "Your drinks are being made right now.",
  },
  ready: {
    label: "Ready",
    action: "Mark ready",
    guestTitle: "Ready for pickup",
    guestDetail: "Your order is waiting at the Matcha 9 counter.",
  },
  picked_up: {
    label: "Picked up",
    action: "Mark picked up",
    guestTitle: "Picked up. Enjoy!",
    guestDetail: "Thanks for ordering ahead. See you at the counter again soon.",
  },
  cancelled: {
    label: "Cancelled",
    action: "Cancel order",
    guestTitle: "This order was cancelled",
    guestDetail: "If that’s unexpected, give us a call and we’ll sort it out.",
  },
};

export type OrderLine = {
  id: string;
  menuItemId: string | null;
  name: string;
  options: SelectedOption[];
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderEvent = { status: OrderStatus; note: string | null; createdAt: string };

export type ToastSync = "not_connected" | "pending" | "sent" | "failed";

export type Order = {
  id: string;
  number: number;
  publicId: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  pickupAt: string;
  pickupAsap: boolean;
  subtotalCents: number;
  itemCount: number;
  toastStatus: ToastSync;
  toastReference: string | null;
  toastError: string | null;
  createdAt: string;
  updatedAt: string;
  lines: OrderLine[];
  events: OrderEvent[];
};

/** What the public tracking page may show: no phone or email. */
export type GuestOrder = Pick<
  Order,
  | "number"
  | "publicId"
  | "status"
  | "pickupAt"
  | "pickupAsap"
  | "subtotalCents"
  | "itemCount"
  | "lines"
  | "events"
  | "createdAt"
  | "notes"
> & { firstName: string };

/** A bag line as the browser sends it. Names and prices are always re-read on the server. */
export type BagLineInput = { itemId: string; quantity: number; selections: SelectionInput };

export const orderLimits = { lines: 20, quantity: 20, items: 40 } as const;

/** Ticket numbers start here, like a fresh roll of order tickets. */
export const FIRST_ORDER_NUMBER = 101;

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

/** Price a bag against the current menu. Names and prices from the browser are never used. */
export function priceBag(menu: Map<string, MenuItem>, input: BagLineInput[]): Quote {
  const lines = input.slice(0, orderLimits.lines);
  const quoted: QuotedLine[] = [];
  const issues: Quote["issues"] = [];

  for (const [index, line] of lines.entries()) {
    const item = menu.get(line.itemId);
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

/**
 * Everything that has to be true before an order is accepted: ordering is open, the bag is
 * clean, and the pickup time is one the checkout could have offered at this moment.
 */
export function checkOrder(
  settings: Settings,
  quote: Quote,
  pickup: string,
  now = new Date(),
): { ok: true; pickupAt: Date; asap: boolean } | { ok: false; error: string } {
  if (settings.ordering.mode === "paused") {
    return { ok: false, error: settings.ordering.pausedMessage };
  }
  if (settings.ordering.mode !== "onsite") {
    return { ok: false, error: "Online orders are being taken on our Toast ordering page." };
  }
  if (quote.issues.length) {
    return { ok: false, error: `${quote.issues[0]!.message} Please check your bag.` };
  }
  if (!quote.lines.length) return { ok: false, error: "Your bag is empty." };

  const plan = planPickup(now, settings.store.hours, settings.ordering);
  if (pickup === "asap") {
    if (!plan.asap) {
      return { ok: false, error: "ASAP pickup isn’t available now. Please pick a time." };
    }
    return { ok: true, pickupAt: new Date(plan.asap.at), asap: true };
  }
  const offered = plan.days.some((d) => d.slots.some((s) => s.at === pickup));
  if (!offered) {
    return { ok: false, error: "That pickup time is no longer available. Please pick another." };
  }
  return { ok: true, pickupAt: new Date(pickup), asap: false };
}

/** The guest-safe view of an order, for its public tracking page. */
export function toGuestOrder(order: Order): GuestOrder {
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

/** May an order move from one status to another? Forward one step, or cancel while open. */
export function canMoveOrder(from: OrderStatus, to: OrderStatus) {
  return (
    nextStatus[from] === to || (to === "cancelled" && from !== "picked_up" && from !== "cancelled")
  );
}

export type OrderStats = {
  todayCount: number;
  todaySalesCents: number;
  todayItems: number;
  received: number;
  preparing: number;
  ready: number;
};

/** Today's numbers from a list of orders ("today" starts at midnight, store time). */
export function statsFor(orders: Order[], startOfDay: Date): OrderStats {
  const today = orders.filter(
    (o) => new Date(o.createdAt) >= startOfDay && o.status !== "cancelled",
  );
  const count = (status: OrderStatus) => orders.filter((o) => o.status === status).length;
  return {
    todayCount: today.length,
    todaySalesCents: today.reduce((sum, o) => sum + o.subtotalCents, 0),
    todayItems: today.reduce((sum, o) => sum + o.itemCount, 0),
    received: count("received"),
    preparing: count("preparing"),
    ready: count("ready"),
  };
}
