/**
 * Pickup times in the store's own time zone (Chicago), whatever zone the server or the guest
 * is in. Pure functions of "now" and the settings, so the server can recompute and verify
 * exactly what the checkout offered.
 */
import { formatClock, STORE_TIME_ZONE, type DayHours, type OrderingSettings } from "./settings";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sunday */
  weekday: number;
};

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

export function zonedParts(date: Date, timeZone = STORE_TIME_ZONE): ZonedParts {
  const parts: Record<string, string> = {};
  for (const p of partsFormatter(timeZone).formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    weekday: weekdayIndex[parts.weekday ?? "Sun"] ?? 0,
  };
}

/** The instant at which the wall clock in `timeZone` reads the given date and time. */
export function zonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = STORE_TIME_ZONE,
): Date {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  // Two passes settle the offset, including across a daylight-saving change.
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(new Date(guess), timeZone);
    const diff = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - target;
    if (diff === 0) break;
    guess -= diff;
  }
  return new Date(guess);
}

export type PickupSlot = { at: string; label: string };
export type PickupDay = { key: string; label: string; slots: PickupSlot[] };

export type PickupPlan = {
  openNow: boolean;
  /** Earliest pickup if the bar is open right now, `prepMinutes` from now. */
  asap: { at: string; minutes: number } | null;
  /** Scheduled pickup times, grouped by day. Days without any time left are omitted. */
  days: PickupDay[];
  /** When the bar next opens, if it's closed now. */
  nextOpening: string | null;
};

const MINUTE = 60_000;

function toMinutes(value: string) {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 60 + m;
}

function clockLabel(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  return formatClock(`${p.hour}:${String(p.minute).padStart(2, "0")}`);
}

/** Open and close instants for the calendar day `offset` days after `now` (store time). */
function dayWindow(now: Date, offset: number, hours: DayHours[], timeZone: string) {
  const today = zonedParts(now, timeZone);
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const weekday = (today.weekday + offset) % 7;
  const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const day = hours[weekday];
  if (!day || day.closed || toMinutes(day.close) <= toMinutes(day.open)) {
    return { key, y, m, d, weekday, open: null, close: null };
  }
  const [oh, om] = [Math.floor(toMinutes(day.open) / 60), toMinutes(day.open) % 60];
  const [ch, cm] = [Math.floor(toMinutes(day.close) / 60), toMinutes(day.close) % 60];
  return {
    key,
    y,
    m,
    d,
    weekday,
    open: zonedTime(y, m, d, oh, om, timeZone),
    close: zonedTime(y, m, d, ch, cm, timeZone),
  };
}

function dayLabel(offset: number, date: Date, timeZone: string) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function planPickup(
  now: Date,
  hours: DayHours[],
  ordering: Pick<OrderingSettings, "prepMinutes" | "slotMinutes" | "daysAhead">,
  timeZone = STORE_TIME_ZONE,
): PickupPlan {
  const earliest = new Date(now.getTime() + ordering.prepMinutes * MINUTE);
  const step = Math.max(5, ordering.slotMinutes) * MINUTE;
  const days: PickupDay[] = [];

  for (let offset = 0; offset <= ordering.daysAhead; offset++) {
    const w = dayWindow(now, offset, hours, timeZone);
    if (!w.open || !w.close) continue;
    const start = Math.max(w.open.getTime(), earliest.getTime());
    let t = w.open.getTime() + Math.ceil((start - w.open.getTime()) / step) * step;
    const slots: PickupSlot[] = [];
    for (; t < w.close.getTime(); t += step) {
      const at = new Date(t);
      slots.push({ at: at.toISOString(), label: clockLabel(at, timeZone) });
    }
    if (slots.length) days.push({ key: w.key, label: dayLabel(offset, w.open, timeZone), slots });
  }

  const today = dayWindow(now, 0, hours, timeZone);
  const openNow = !!today.open && !!today.close && now >= today.open && now < today.close;
  const asapAt = new Date(Math.ceil(earliest.getTime() / MINUTE) * MINUTE);
  const asap =
    openNow && today.close && asapAt < today.close
      ? { at: asapAt.toISOString(), minutes: ordering.prepMinutes }
      : null;

  let nextOpening: string | null = null;
  if (!openNow) {
    for (let offset = 0; offset <= 7 && !nextOpening; offset++) {
      const w = dayWindow(now, offset, hours, timeZone);
      if (w.open && w.open > now) nextOpening = w.open.toISOString();
    }
  }

  return { openNow, asap, days, nextOpening };
}

/** "Today at 11:30 am", "Tomorrow at 9 am" or "Thu, Oct 1 at 9 am", in store time. */
export function describeTime(at: Date, now = new Date(), timeZone = STORE_TIME_ZONE): string {
  const a = zonedParts(at, timeZone);
  const n = zonedParts(now, timeZone);
  const dayDiff = Math.round(
    (Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(n.year, n.month - 1, n.day)) / 86_400_000,
  );
  const time = clockLabel(at, timeZone);
  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Tomorrow at ${time}`;
  if (dayDiff === -1) return `Yesterday at ${time}`;
  return `${dayLabel(dayDiff, at, timeZone)} at ${time}`;
}

/** Clock time only, in store time: "11:42 am". */
export function storeClock(at: Date, timeZone = STORE_TIME_ZONE): string {
  return clockLabel(at, timeZone);
}

/** Calendar day key in store time, e.g. "2026-09-30". */
export function storeDayKey(at: Date, timeZone = STORE_TIME_ZONE): string {
  const p = zonedParts(at, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Start of the store's current calendar day, as an instant. */
export function startOfStoreDay(now = new Date(), timeZone = STORE_TIME_ZONE): Date {
  const p = zonedParts(now, timeZone);
  return zonedTime(p.year, p.month, p.day, 0, 0, timeZone);
}
