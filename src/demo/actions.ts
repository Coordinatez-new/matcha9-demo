"use client";

import type {
  CategoryActions,
  EditorActions,
  MenuActions,
  OrderActions,
  OverviewActions,
  SettingsActions,
} from "@/components/admin/types";
import type { CheckoutActions } from "@/components/order/CheckoutForm";
import {
  MAX_UPLOAD_BYTES,
  orderingModes,
  parseAnnouncementForm,
  parseBagLines,
  parseCategoryForm,
  parseHoursForm,
  parseItemForm,
  parseOrderForm,
  parseOrderingForm,
  parseToastForm,
  type FormState,
  type PlaceOrderState,
  type UploadResult,
} from "@/lib/forms";
import type { MenuItem } from "@/lib/menu";
import {
  FIRST_ORDER_NUMBER,
  canMoveOrder,
  checkOrder,
  priceBag,
  type Order,
  type Quote,
} from "@/lib/orders";
import { readDemo, updateDemo, type DemoState } from "./store";

/**
 * The preview's versions of the server actions. Same validation (lib/forms), same pricing and
 * pickup rules (lib/orders); the data just lives in the browser instead of Postgres.
 */

const menuMap = (state: DemoState) => new Map(state.items.map((i) => [i.id, i]));
const nowIso = () => new Date().toISOString();

function randomId(length = 12) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

// ── Checkout ───────────────────────────────────────────────────────────────

export const demoCheckout: CheckoutActions = {
  async quote(input: unknown): Promise<Quote> {
    const lines = parseBagLines(input);
    if (!lines) {
      return {
        lines: [],
        issues: [
          { index: -1, message: "Your bag couldn’t be read. Please add your drinks again." },
        ],
        subtotalCents: 0,
        itemCount: 0,
      };
    }
    return priceBag(menuMap(readDemo()), lines);
  },

  async place(input: unknown): Promise<PlaceOrderState> {
    const parsed = parseOrderForm(input);
    if (!parsed.ok) return parsed.state;
    const state = readDemo();
    const quote = priceBag(menuMap(state), parsed.data.lines);
    const check = checkOrder(state.settings, quote, parsed.data.pickup);
    if (!check.ok) return check;

    const createdAt = nowIso();
    const number = state.orders.reduce((n, o) => Math.max(n, o.number), FIRST_ORDER_NUMBER - 1) + 1;
    const order: Order = {
      id: randomId(16),
      number,
      publicId: randomId(12),
      status: "received",
      customerName: parsed.data.name,
      customerPhone: parsed.data.phone,
      customerEmail: parsed.data.email,
      notes: parsed.data.notes,
      pickupAt: check.pickupAt.toISOString(),
      pickupAsap: check.asap,
      subtotalCents: quote.subtotalCents,
      itemCount: quote.itemCount,
      toastStatus: "not_connected",
      toastReference: null,
      toastError: null,
      createdAt,
      updatedAt: createdAt,
      lines: quote.lines.map((l, i) => ({
        id: `${number}-${i}`,
        menuItemId: l.itemId,
        name: l.name,
        options: l.selections,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
        lineTotalCents: l.lineTotalCents,
      })),
      events: [{ status: "received", note: null, createdAt }],
    };
    updateDemo((s) => ({ ...s, orders: [order, ...s.orders] }));
    return { ok: true, publicId: order.publicId };
  },
};

// ── Orders ─────────────────────────────────────────────────────────────────

export const demoOrderActions: OrderActions = {
  async setOrderStatus(id, status) {
    updateDemo((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        if (o.id !== id || !canMoveOrder(o.status, status)) return o;
        const at = nowIso();
        return {
          ...o,
          status,
          updatedAt: at,
          events: [...o.events, { status, note: null, createdAt: at }],
        };
      }),
    }));
  },
  async retryToast() {
    // The preview is never connected to Toast.
  },
};

// ── Menu ───────────────────────────────────────────────────────────────────

function renumber<T extends { sort: number }>(list: T[]) {
  return list.map((entry, sort) => ({ ...entry, sort }));
}

function moveIn<T extends { id: string; sort: number }>(list: T[], id: string, direction: -1 | 1) {
  const sorted = [...list].sort((a, b) => a.sort - b.sort);
  const from = sorted.findIndex((e) => e.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= sorted.length) return list;
  const moved = sorted[from]!;
  sorted[from] = sorted[to]!;
  sorted[to] = moved;
  return renumber(sorted);
}

export const demoMenuActions: MenuActions & OverviewActions = {
  async setItemFlag(id, flag, value) {
    updateDemo((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, [flag]: value, updatedAt: nowIso() } : i)),
    }));
  },
  async moveItem(id, direction) {
    updateDemo((s) => ({ ...s, items: moveIn(s.items, id, direction) }));
  },
  async setOrderingMode(mode) {
    if (!orderingModes.includes(mode)) return;
    updateDemo((s) => ({
      ...s,
      settings: { ...s.settings, ordering: { ...s.settings.ordering, mode } },
    }));
  },
};

/** Shrink an uploaded photo in the browser and keep it as a data URL. */
async function toDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  // WebP where the browser can encode it (it falls back to PNG otherwise).
  let src = canvas.toDataURL("image/webp", 0.78);
  if (!src.startsWith("data:image/webp")) src = canvas.toDataURL("image/jpeg", 0.8);
  return { src, width, height };
}

export const demoEditorActions: EditorActions = {
  async saveItem(id, input) {
    const parsed = parseItemForm(input, { allowDataUrls: true });
    if (!parsed.ok) return parsed.result;
    const data = parsed.data;
    const state = readDemo();
    if (id && !state.items.some((i) => i.id === id)) {
      return { ok: false, message: "That drink no longer exists.", fields: {} };
    }
    if (state.items.some((i) => i.slug === data.slug && i.id !== id)) {
      return {
        ok: false,
        message: "Another drink already uses that web address.",
        fields: { slug: "Already used by another drink." },
      };
    }
    if (data.categoryId && !state.categories.some((c) => c.id === data.categoryId)) {
      data.categoryId = null;
    }
    const savedId = id ?? `${data.slug}-${randomId(4).toLowerCase()}`;
    const saved = updateDemo((s) => {
      if (id) {
        return {
          ...s,
          items: s.items.map((i) => (i.id === id ? { ...i, ...data, updatedAt: nowIso() } : i)),
        };
      }
      const item: MenuItem = {
        ...data,
        id: savedId,
        sort: s.items.reduce((n, i) => Math.max(n, i.sort), -1) + 1,
        updatedAt: nowIso(),
      };
      return { ...s, items: [...s.items, item] };
    });
    if (!saved) {
      return {
        ok: false,
        message: "This browser’s storage is full. Remove a photo or reset the demo.",
        fields: {},
      };
    }
    return { ok: true, id: savedId };
  },

  async deleteItem(id) {
    updateDemo((s) => ({ ...s, items: renumber(s.items.filter((i) => i.id !== id)) }));
  },

  async uploadImage(form: FormData): Promise<UploadResult> {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Choose a photo first." };
    }
    if (!file.type.startsWith("image/"))
      return { ok: false, message: "Please choose an image file." };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: "That image is over 10 MB." };
    try {
      const image = { ...(await toDataUrl(file)), label: file.name.replace(/\.[^.]+$/, "") };
      const saved = updateDemo((s) => ({ ...s, uploads: [image, ...s.uploads] }));
      if (!saved) {
        return { ok: false, message: "This browser can’t store more photos in the demo." };
      }
      return { ok: true, image };
    } catch {
      return { ok: false, message: "That file couldn’t be read as an image." };
    }
  },
};

// ── Categories ─────────────────────────────────────────────────────────────

export const demoCategoryActions: CategoryActions = {
  async saveCategory(_prev: FormState, form: FormData): Promise<FormState> {
    const parsed = parseCategoryForm(form);
    if (!parsed.ok) return parsed.state;
    const { id, label, description } = parsed.data;
    const exists = readDemo().categories.some((c) => c.id === id);
    if (parsed.isNew && exists) {
      return { ok: false, message: "A category with that name already exists.", fields: {} };
    }
    updateDemo((s) => ({
      ...s,
      categories: parsed.isNew
        ? [...s.categories, { id, label, description, sort: s.categories.length }]
        : s.categories.map((c) => (c.id === id ? { ...c, label, description } : c)),
    }));
    return { ok: true, message: parsed.isNew ? "Category added." : "Saved." };
  },
  async moveCategory(id, direction) {
    updateDemo((s) => ({ ...s, categories: moveIn(s.categories, id, direction) }));
  },
  async deleteCategory(id) {
    updateDemo((s) => ({
      ...s,
      categories: renumber(s.categories.filter((c) => c.id !== id)),
      items: s.items.map((i) => (i.categoryId === id ? { ...i, categoryId: null } : i)),
    }));
  },
};

// ── Settings ───────────────────────────────────────────────────────────────

function saver<K extends keyof DemoState["settings"]>(
  key: K,
  parse: (
    form: FormData,
  ) => { ok: true; data: DemoState["settings"][K] } | { ok: false; state: FormState },
  message: string,
) {
  return async (_prev: FormState, form: FormData): Promise<FormState> => {
    const parsed = parse(form);
    if (!parsed.ok) return parsed.state;
    updateDemo((s) => ({ ...s, settings: { ...s.settings, [key]: parsed.data } }));
    return { ok: true, message };
  };
}

export const demoSettingsActions: SettingsActions = {
  saveOrdering: saver("ordering", parseOrderingForm, "Ordering settings saved."),
  saveHours: saver("store", parseHoursForm, "Opening hours saved."),
  saveAnnouncement: saver("announcement", parseAnnouncementForm, "Announcement saved."),
  saveToast: saver("toast", parseToastForm, "Toast link saved."),
};

// ── Sign in ────────────────────────────────────────────────────────────────

/** The preview's sign-in accepts any email and password: there's nothing to protect. */
export async function demoSignIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email || !String(form.get("password") ?? "")) {
    return { ok: false, message: "Type any email and password to open the demo dashboard." };
  }
  updateDemo((s) => ({ ...s, signedIn: true }));
  return { ok: true, message: "Signed in." };
}

export async function demoSignOut() {
  updateDemo((s) => ({ ...s, signedIn: false }));
}
