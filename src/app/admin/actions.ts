"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  orderingModes,
  parseAnnouncementForm,
  parseCategoryForm,
  parseHoursForm,
  parseItemForm,
  parseOrderingForm,
  parseToastForm,
  type FormState,
  type ItemFormInput,
  type SaveItemResult,
  type UploadResult,
} from "@/lib/forms";
import type { OrderStatus } from "@/lib/orders";
import type { OrderingMode } from "@/lib/settings";
import { requireAdmin, signIn, signOut } from "@/server/auth";
import {
  categoryExists,
  createItem,
  deleteCategory,
  deleteItem,
  moveCategory,
  moveItem,
  saveCategory,
  setItemFlag,
  slugTaken,
  updateItem,
} from "@/server/menu";
import { saveUpload } from "@/server/media";
import { isUuid, retryToast, setOrderStatus } from "@/server/orders";
import { getSettings, saveSettings } from "@/server/settings";

/** Everything the storefront shows can change after a dashboard edit. */
const refreshSite = () => revalidatePath("/", "layout");

// ── Sign in / out ──────────────────────────────────────────────────────────

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await signIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!result.ok) return { ok: false, message: result.error };
  const next = String(form.get("next") ?? "");
  // Only ever continue to a dashboard page.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

// ── Orders ─────────────────────────────────────────────────────────────────

const statuses = ["received", "preparing", "ready", "picked_up", "cancelled"] as const;

export async function setOrderStatusAction(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!isUuid(id) || !statuses.includes(status)) return;
  await setOrderStatus(id, status);
  revalidatePath("/admin", "layout");
  revalidatePath("/order/[id]", "page");
}

export async function retryToastAction(id: string) {
  await requireAdmin();
  if (!isUuid(id)) return;
  await retryToast(id);
  revalidatePath("/admin", "layout");
}

// ── Menu items ─────────────────────────────────────────────────────────────

export async function saveItemAction(
  id: string | null,
  input: ItemFormInput,
): Promise<SaveItemResult> {
  await requireAdmin();
  const parsed = parseItemForm(input);
  if (!parsed.ok) return parsed.result;
  const data = parsed.data;
  if (id && !isUuid(id)) return { ok: false, message: "That drink no longer exists.", fields: {} };
  if (data.categoryId && !(await categoryExists(data.categoryId))) data.categoryId = null;
  if (await slugTaken(data.slug, id ?? undefined)) {
    return {
      ok: false,
      message: "Another drink already uses that web address.",
      fields: { slug: "Already used by another drink." },
    };
  }

  const savedId = id ?? (await createItem(data));
  if (id) await updateItem(id, data);
  refreshSite();
  return { ok: true, id: savedId };
}

const flags = { inStock: "in_stock", isVisible: "is_visible", featured: "featured" } as const;

export async function setItemFlagAction(id: string, flag: keyof typeof flags, value: boolean) {
  await requireAdmin();
  if (!isUuid(id) || !(flag in flags)) return;
  await setItemFlag(id, flags[flag], value);
  refreshSite();
}

export async function moveItemAction(id: string, direction: -1 | 1) {
  await requireAdmin();
  if (!isUuid(id)) return;
  await moveItem(id, direction === -1 ? -1 : 1);
  refreshSite();
}

export async function deleteItemAction(id: string) {
  await requireAdmin();
  if (!isUuid(id)) return;
  await deleteItem(id);
  refreshSite();
  redirect("/admin/menu?deleted=1");
}

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a photo first." };
  }
  try {
    return { ok: true, image: await saveUpload(file) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Upload failed." };
  }
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function saveCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseCategoryForm(form);
  if (!parsed.ok) return parsed.state;
  if (parsed.isNew && (await categoryExists(parsed.data.id))) {
    return { ok: false, message: "A category with that name already exists.", fields: {} };
  }
  await saveCategory(parsed.data, parsed.isNew);
  refreshSite();
  return { ok: true, message: parsed.isNew ? "Category added." : "Saved." };
}

export async function moveCategoryAction(id: string, direction: -1 | 1) {
  await requireAdmin();
  await moveCategory(id, direction === -1 ? -1 : 1);
  refreshSite();
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await deleteCategory(id);
  refreshSite();
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function saveHoursAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseHoursForm(form);
  if (!parsed.ok) return parsed.state;
  await saveSettings("store", parsed.data);
  refreshSite();
  return { ok: true, message: "Opening hours saved." };
}

export async function saveOrderingAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseOrderingForm(form);
  if (!parsed.ok) return parsed.state;
  await saveSettings("ordering", parsed.data);
  refreshSite();
  return { ok: true, message: "Ordering settings saved." };
}

/** One-tap switch from the overview: open, pause, or hand ordering to Toast. */
export async function setOrderingModeAction(mode: OrderingMode) {
  await requireAdmin();
  if (!orderingModes.includes(mode)) return;
  const current = await getSettings();
  await saveSettings("ordering", { ...current.ordering, mode });
  refreshSite();
}

export async function saveAnnouncementAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseAnnouncementForm(form);
  if (!parsed.ok) return parsed.state;
  await saveSettings("announcement", parsed.data);
  refreshSite();
  return { ok: true, message: "Announcement saved." };
}

export async function saveToastAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseToastForm(form);
  if (!parsed.ok) return parsed.state;
  await saveSettings("toast", parsed.data);
  refreshSite();
  return { ok: true, message: "Toast link saved." };
}
