import "server-only";

/**
 * Toast is the restaurant's point of sale. Website orders are always saved here first (so the
 * dashboard has them even if Toast is unreachable), then forwarded to Toast when API access is
 * configured through the TOAST_* environment variables (see .env.example).
 *
 * The live request follows Toast's Orders API v2 (authentication, then POST /orders/v2/orders).
 * It needs a Toast integration with order-write access, and hasn't been run against Toast yet:
 * verify it in Toast's sandbox before turning it on for the live restaurant.
 */

export type ToastStatus = "not_connected" | "pending" | "sent" | "failed";

export type ToastResult = { status: ToastStatus; reference: string | null; error: string | null };

type ToastConfig = {
  host: string;
  clientId: string;
  clientSecret: string;
  restaurantGuid: string;
  diningOptionGuid: string;
  menuGroupGuid: string;
};

function config(): ToastConfig | null {
  const env = process.env;
  const required = {
    clientId: env.TOAST_CLIENT_ID,
    clientSecret: env.TOAST_CLIENT_SECRET,
    restaurantGuid: env.TOAST_RESTAURANT_GUID,
    diningOptionGuid: env.TOAST_TAKEOUT_DINING_OPTION_GUID,
    menuGroupGuid: env.TOAST_MENU_GROUP_GUID,
  };
  if (Object.values(required).some((v) => !v)) return null;
  return {
    host: env.TOAST_API_HOST || "https://ws-api.toasttab.com",
    ...(required as Omit<ToastConfig, "host">),
  };
}

/** What the dashboard shows about the Toast connection. */
export function toastConnection() {
  const c = config();
  return c
    ? { live: true as const, host: new URL(c.host).host, restaurantGuid: c.restaurantGuid }
    : { live: false as const };
}

let token: { value: string; expiresAt: number } | null = null;

async function accessToken(c: ToastConfig) {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const res = await fetch(`${c.host}/authentication/v1/authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: c.clientId,
      clientSecret: c.clientSecret,
      userAccessType: "TOAST_MACHINE_CLIENT",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Toast sign-in failed (${res.status})`);
  const body = (await res.json()) as { token?: { accessToken?: string; expiresIn?: number } };
  const value = body.token?.accessToken;
  if (!value) throw new Error("Toast sign-in returned no token");
  token = { value, expiresAt: Date.now() + (body.token?.expiresIn ?? 3600) * 1000 };
  return value;
}

export type ToastOrderInput = {
  number: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  pickupAt: Date;
  asap: boolean;
  lines: { toastGuid: string | null; name: string; quantity: number }[];
};

/** Toast wants timestamps like 2026-09-30T16:30:00.000+0000. */
const toastDate = (d: Date) => d.toISOString().replace("Z", "+0000");

export async function sendOrderToToast(order: ToastOrderInput): Promise<ToastResult> {
  const c = config();
  if (!c) return { status: "not_connected", reference: null, error: null };

  const unmapped = order.lines.filter((l) => !l.toastGuid).map((l) => l.name);
  if (unmapped.length) {
    return {
      status: "failed",
      reference: null,
      error: `No Toast item ID for: ${unmapped.join(", ")}. Add it in the menu editor.`,
    };
  }

  const [firstName, ...rest] = order.customerName.trim().split(/\s+/);
  const payload = {
    entityType: "Order",
    diningOption: { guid: c.diningOptionGuid, entityType: "DiningOption" },
    ...(order.asap ? {} : { promisedDate: toastDate(order.pickupAt) }),
    checks: [
      {
        entityType: "Check",
        customer: {
          entityType: "Customer",
          firstName,
          lastName: rest.join(" ") || "-",
          phone: order.customerPhone.replace(/\D/g, ""),
          ...(order.customerEmail ? { email: order.customerEmail } : {}),
        },
        selections: order.lines.map((l) => ({
          entityType: "MenuItemSelection",
          item: { guid: l.toastGuid, entityType: "MenuItem" },
          itemGroup: { guid: c.menuGroupGuid, entityType: "MenuGroup" },
          quantity: l.quantity,
          modifiers: [],
        })),
      },
    ],
  };

  try {
    const res = await fetch(`${c.host}/orders/v2/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await accessToken(c)}`,
        "Toast-Restaurant-External-ID": c.restaurantGuid,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return {
        status: "failed",
        reference: null,
        error: `Toast returned ${res.status}: ${detail}`,
      };
    }
    const body = (await res.json()) as { guid?: string };
    return { status: "sent", reference: body.guid ?? null, error: null };
  } catch (error) {
    return {
      status: "failed",
      reference: null,
      error: error instanceof Error ? error.message : "Couldn’t reach Toast",
    };
  }
}
