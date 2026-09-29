/**
 * Store settings the admin edits from the dashboard: opening hours, how online ordering works,
 * the announcement bar and the Toast links. Shared by server and client; defaults live here.
 */

export type DayHours = {
  closed: boolean;
  /** 24-hour "HH:MM" in the store's time zone. */
  open: string;
  close: string;
};

export type StoreSettings = {
  /** Index 0 is Sunday, matching `Date#getDay()`. */
  hours: DayHours[];
  /** Short note shown next to the hours, e.g. "Hours may change on holidays." */
  hoursNote: string;
};

/**
 * - `onsite`: guests order and check out here; orders land in the dashboard (and in Toast,
 *   once its API is connected).
 * - `toast`: order buttons hand guests to the Toast online ordering page instead.
 * - `paused`: online ordering is switched off for now.
 */
export type OrderingMode = "onsite" | "toast" | "paused";

export type OrderingSettings = {
  mode: OrderingMode;
  /** Minutes the bar needs before the earliest pickup. */
  prepMinutes: number;
  /** Spacing of the scheduled pickup times. */
  slotMinutes: number;
  /** How many days after today guests can schedule for (0 = today only). */
  daysAhead: number;
  pausedMessage: string;
  pickupInstructions: string;
};

export type AnnouncementSettings = {
  enabled: boolean;
  label: string;
  text: string;
  href: string;
};

export type ToastSettings = {
  /** Toast online ordering page, used for delivery and when ordering is handed to Toast. */
  onlineOrderingUrl: string;
};

export type Settings = {
  store: StoreSettings;
  ordering: OrderingSettings;
  announcement: AnnouncementSettings;
  toast: ToastSettings;
};

export const STORE_TIME_ZONE = "America/Chicago";

// Hours from the client's own draft site ("Daily, 9 am – 2 pm"); still to be confirmed.
const daily: DayHours = { closed: false, open: "09:00", close: "14:00" };

export const defaultSettings: Settings = {
  store: {
    hours: Array.from({ length: 7 }, () => ({ ...daily })),
    hoursNote: "",
  },
  ordering: {
    mode: "onsite",
    prepMinutes: 10,
    slotMinutes: 15,
    daysAhead: 1,
    pausedMessage:
      "Online ordering is taking a short break. Come see us at the bar, we’re whisking as usual.",
    pickupInstructions:
      "Head to the Matcha 9 counter inside Taco Maya and give the name on your order.",
  },
  announcement: {
    enabled: true,
    label: "New",
    text: "Very Berry Matcha, a whole-food blend of nearly forty organic fruits & vegetables",
    href: "/menu/very-berry",
  },
  toast: {
    onlineOrderingUrl: "https://tacomaya.toast.site/order/taco-maya-jhoom-bar",
  },
};

export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "09:00" → "9 am", "14:30" → "2:30 pm". */
export function formatClock(value: string): string {
  const [h = 0, m = 0] = value.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatRange(day: DayHours): string {
  return day.closed ? "Closed" : `${formatClock(day.open)} – ${formatClock(day.close)}`;
}

const short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Collapse the week into readable lines: "Daily · 9 am – 2 pm", or runs of days that share
 * hours, e.g. "Mon – Fri · 9 am – 2 pm", "Sat – Sun · 10 am – 3 pm". Weeks start on Monday.
 */
export function summarizeHours(hours: DayHours[]): { label: string; time: string }[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const same = (a: DayHours, b: DayHours) =>
    a.closed === b.closed && (a.closed || (a.open === b.open && a.close === b.close));

  if (order.every((d) => same(hours[d]!, hours[1]!))) {
    return [{ label: "Daily", time: formatRange(hours[1]!) }];
  }

  const runs: { from: number; to: number }[] = [];
  for (const d of order) {
    const last = runs.at(-1);
    if (last && same(hours[last.to]!, hours[d]!)) last.to = d;
    else runs.push({ from: d, to: d });
  }
  return runs.map(({ from, to }) => ({
    label: from === to ? short[from]! : `${short[from]} – ${short[to]}`,
    time: formatRange(hours[from]!),
  }));
}

/** One-line hours, e.g. "Daily, 9 am – 2 pm". */
export function hoursLine(hours: DayHours[]): string {
  return summarizeHours(hours)
    .map((r) => `${r.label}, ${r.time}`)
    .join(" · ");
}
