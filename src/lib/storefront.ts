import type { OrderableItem } from "./menu";
import { describeTime, planPickup } from "./pickup";
import { hoursLine, type OrderingMode, type Settings } from "./settings";

/** Ordering state every storefront page needs: rendered on the server, read by the bag. */
export type Storefront = {
  mode: OrderingMode;
  toastUrl: string;
  pausedMessage: string;
  pickupInstructions: string;
  prepMinutes: number;
  openNow: boolean;
  /** When the bar next opens, if it's closed now, e.g. "Tomorrow at 9 am". */
  nextOpening: string | null;
  hours: string;
  /** A few drinks to suggest when the bag is empty. */
  suggestions: OrderableItem[];
};

export function buildStorefront(
  settings: Settings,
  suggestions: OrderableItem[],
  now = new Date(),
): Storefront {
  const plan = planPickup(now, settings.store.hours, settings.ordering);
  return {
    mode: settings.ordering.mode,
    toastUrl: settings.toast.onlineOrderingUrl,
    pausedMessage: settings.ordering.pausedMessage,
    pickupInstructions: settings.ordering.pickupInstructions,
    prepMinutes: settings.ordering.prepMinutes,
    openNow: plan.openNow,
    nextOpening: plan.nextOpening ? describeTime(new Date(plan.nextOpening), now) : null,
    hours: hoursLine(settings.store.hours),
    suggestions,
  };
}
