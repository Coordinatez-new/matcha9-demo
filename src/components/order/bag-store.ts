"use client";

import { useSyncExternalStore } from "react";
import {
  describeSelections,
  lineKey,
  resolveSelections,
  type ImageRef,
  type OrderableItem,
  type SelectionInput,
} from "@/lib/menu";
import { orderLimits } from "@/lib/orders";

/**
 * The guest's bag, kept in localStorage so it survives reloads and syncs across tabs.
 * Names and prices here are for display only; the server re-prices everything at checkout.
 */

export type BagLine = {
  key: string;
  itemId: string;
  slug: string;
  name: string;
  image: ImageRef | null;
  imageAlt: string;
  selections: SelectionInput;
  summary: string;
  unitPriceCents: number;
  quantity: number;
};

const KEY = "m9-bag-v1";
const EMPTY: BagLine[] = [];
let snapshot: BagLine[] | null = null;
const listeners = new Set<() => void>();

function isLine(value: unknown): value is BagLine {
  const l = value as BagLine;
  return (
    !!l &&
    typeof l.key === "string" &&
    typeof l.itemId === "string" &&
    typeof l.name === "string" &&
    typeof l.unitPriceCents === "number" &&
    typeof l.quantity === "number"
  );
}

function read(): BagLine[] {
  if (snapshot) return snapshot;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    snapshot = Array.isArray(parsed) ? parsed.filter(isLine) : EMPTY;
  } catch {
    snapshot = EMPTY;
  }
  return snapshot;
}

function write(lines: BagLine[]) {
  snapshot = lines;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or storage full: the bag still works for this page view.
  }
  for (const listener of listeners) listener();
}

export const bagStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      snapshot = null;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,

  /** Add a drink; the same drink with the same options stacks onto its existing line. */
  add(item: OrderableItem, selections: SelectionInput, quantity = 1) {
    const resolved = resolveSelections(item, selections);
    if (!resolved.ok) return null;
    const normalized: SelectionInput = {};
    for (const s of resolved.selections) {
      (normalized[s.groupId] ??= []).push(s.choiceId);
    }
    const key = lineKey(item.id, normalized);
    const lines = read();
    const existing = lines.find((l) => l.key === key);
    const next = existing
      ? lines.map((l) =>
          l.key === key
            ? { ...l, quantity: Math.min(l.quantity + quantity, orderLimits.quantity) }
            : l,
        )
      : [
          ...lines,
          {
            key,
            itemId: item.id,
            slug: item.slug,
            name: item.name,
            image: item.productImage ?? item.photoImage,
            imageAlt: item.productImageAlt,
            selections: normalized,
            summary: describeSelections(resolved.selections),
            unitPriceCents: resolved.unitPriceCents,
            quantity: Math.min(quantity, orderLimits.quantity),
          },
        ].slice(-orderLimits.lines);
    write(next);
    return key;
  },

  setQuantity(key: string, quantity: number) {
    const q = Math.min(Math.max(Math.round(quantity), 0), orderLimits.quantity);
    write(
      q === 0
        ? read().filter((l) => l.key !== key)
        : read().map((l) => (l.key === key ? { ...l, quantity: q } : l)),
    );
  },

  remove(key: string) {
    write(read().filter((l) => l.key !== key));
  },

  /** Keep display prices in line with what the server quoted. */
  reprice(prices: Map<string, number>) {
    const lines = read();
    if (!lines.some((l) => prices.has(l.key) && prices.get(l.key) !== l.unitPriceCents)) return;
    write(lines.map((l) => (prices.has(l.key) ? { ...l, unitPriceCents: prices.get(l.key)! } : l)));
  },

  clear() {
    write(EMPTY);
  },
};

const noop = () => () => {};

/** False during server render and hydration, true once the bag has been read in the browser. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
