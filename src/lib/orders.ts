import type { SelectedOption, SelectionInput } from "./menu";

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
