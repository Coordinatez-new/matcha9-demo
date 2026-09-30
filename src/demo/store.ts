"use client";

import { useSyncExternalStore } from "react";
import { starterCategories, starterItems } from "@/content/menu";
import type { Category, LibraryImage, MenuItem } from "@/lib/menu";
import type { Order } from "@/lib/orders";
import { defaultSettings, type Settings } from "@/lib/settings";

/**
 * The GitHub Pages preview has no server, so the menu, settings and orders live here, in the
 * visitor's browser (localStorage). Every tab sees the same data: place an order in one tab and
 * it appears on the dashboard in another. Nothing leaves the browser.
 */

export type DemoState = {
  version: 1;
  items: MenuItem[];
  categories: Category[];
  settings: Settings;
  orders: Order[];
  /** Photos uploaded in the preview's dashboard, as data URLs. */
  uploads: LibraryImage[];
  signedIn: boolean;
};

const KEY = "m9-demo-v1";

export const initialState: DemoState = {
  version: 1,
  items: starterItems(),
  categories: starterCategories,
  settings: defaultSettings,
  orders: [],
  uploads: [],
  signedIn: false,
};

let snapshot: DemoState | null = null;
const listeners = new Set<() => void>();

function merge(saved: Partial<DemoState>): DemoState {
  const s = saved.settings ?? defaultSettings;
  return {
    ...initialState,
    ...saved,
    version: 1,
    settings: {
      store: { ...defaultSettings.store, ...s.store },
      ordering: { ...defaultSettings.ordering, ...s.ordering },
      announcement: { ...defaultSettings.announcement, ...s.announcement },
      toast: { ...defaultSettings.toast, ...s.toast },
    },
  };
}

function read(): DemoState {
  if (snapshot) return snapshot;
  try {
    const raw = window.localStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<DemoState>) : null;
    snapshot = saved?.version === 1 ? merge(saved) : initialState;
  } catch {
    snapshot = initialState;
  }
  return snapshot;
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Apply a change. Returns false if the browser refused to store it (storage full), in which
 * case the change still applies for this page view.
 */
export function updateDemo(change: (state: DemoState) => DemoState): boolean {
  const next = change(read());
  snapshot = next;
  let saved = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    saved = false;
  }
  emit();
  return saved;
}

/** Start over from the real starting menu. */
export function resetDemo() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
  snapshot = initialState;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY && e.key !== null) return;
    snapshot = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const readDemo = read;

/** The demo data. The server render and first paint use the starting data, then the saved one. */
export function useDemoState() {
  return useSyncExternalStore(subscribe, read, () => initialState);
}

const bySort = (a: { sort: number; name?: string; label?: string }, b: typeof a) =>
  a.sort - b.sort || (a.name ?? a.label ?? "").localeCompare(b.name ?? b.label ?? "");

export function sortedItems(state: DemoState) {
  return [...state.items].sort(bySort);
}

export function sortedCategories(state: DemoState) {
  return [...state.categories].sort(bySort);
}

/** What guests see: visible drinks, and only the categories that have one. */
export function publicMenu(state: DemoState) {
  const items = sortedItems(state).filter((i) => i.isVisible);
  const used = new Set(items.map((i) => i.categoryId));
  return { items, categories: sortedCategories(state).filter((c) => used.has(c.id)) };
}
