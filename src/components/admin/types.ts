import type { FormState, ItemFormInput, SaveItemResult, UploadResult } from "@/lib/forms";
import type { OrderStatus } from "@/lib/orders";
import type { OrderingMode } from "@/lib/settings";

/**
 * What the dashboard can do, as plain async functions. The server build passes its server
 * actions; the GitHub Pages preview passes functions that update the demo store in the browser.
 */

export type FormAction = (prev: FormState, form: FormData) => Promise<FormState>;

export type ItemFlag = "inStock" | "isVisible" | "featured";

export type OrderActions = {
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  retryToast: (id: string) => Promise<void>;
};

export type MenuActions = {
  setItemFlag: (id: string, flag: ItemFlag, value: boolean) => Promise<void>;
  moveItem: (id: string, direction: -1 | 1) => Promise<void>;
};

export type OverviewActions = Pick<MenuActions, "setItemFlag"> & {
  setOrderingMode: (mode: OrderingMode) => Promise<void>;
};

export type EditorActions = {
  saveItem: (id: string | null, input: ItemFormInput) => Promise<SaveItemResult>;
  deleteItem: (id: string) => Promise<void>;
  uploadImage: (form: FormData) => Promise<UploadResult>;
};

export type CategoryActions = {
  saveCategory: FormAction;
  moveCategory: (id: string, direction: -1 | 1) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

export type SettingsActions = {
  saveOrdering: FormAction;
  saveHours: FormAction;
  saveAnnouncement: FormAction;
  saveToast: FormAction;
};

/** The Toast connection as the dashboard shows it. */
export type ToastInfo = { live: false } | { live: true; host: string };
