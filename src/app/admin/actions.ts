"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { MenuItem } from "@/lib/menu";
import type { OrderStatus } from "@/lib/orders";
import type { Settings } from "@/lib/settings";
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
import { saveUpload, type LibraryImage } from "@/server/media";
import { isUuid, retryToast, setOrderStatus } from "@/server/orders";
import { getSettings, saveSettings } from "@/server/settings";

/** Everything the storefront shows can change after a dashboard edit. */
const refreshSite = () => revalidatePath("/", "layout");

export type FormState = { ok: boolean; message: string; fields?: Record<string, string> } | null;

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fields[key] ??= issue.message;
  }
  return fields;
}

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

const slug = z
  .string()
  .trim()
  .min(1, "Add a web address.")
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only.");

const image = z
  .object({
    src: z.string().regex(/^\/(images|media)\/[\w./-]+$/, "Pick an image from the library."),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .nullable();

const optionGroup = z
  .object({
    id: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1, "Name the option.").max(40),
    type: z.enum(["single", "multi"]),
    required: z.boolean(),
    defaultChoiceId: z.string().max(40).nullable(),
    choices: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(40),
          label: z.string().trim().min(1, "Name each choice.").max(40),
          priceCents: z.number().int().min(0).max(5000),
        }),
      )
      .min(1, "Add at least one choice.")
      .max(12),
  })
  .refine((g) => new Set(g.choices.map((c) => c.id)).size === g.choices.length, {
    message: "Each choice needs its own name.",
  })
  .transform((g) => ({
    ...g,
    defaultChoiceId: g.choices.some((c) => c.id === g.defaultChoiceId) ? g.defaultChoiceId : null,
  }));

const itemSchema = z.object({
  name: z.string().trim().min(2, "Give the drink a name.").max(60),
  slug,
  priceCents: z.number().int().min(0, "Price can’t be negative.").max(100_000),
  categoryId: z.string().max(40).nullable(),
  badge: z
    .string()
    .trim()
    .max(20)
    .transform((v) => v || null),
  tagline: z.string().trim().max(140),
  description: z.string().trim().max(1500),
  components: z.array(z.string().trim().min(1).max(40)).max(8),
  ingredients: z
    .object({
      lede: z.string().trim().max(400),
      groups: z
        .array(
          z.object({
            title: z.string().trim().min(1, "Name the group.").max(60),
            items: z.string().trim().min(1, "List the ingredients.").max(2500),
          }),
        )
        .max(12),
      contains: z.string().trim().max(500),
    })
    .nullable(),
  options: z.array(optionGroup).max(6),
  productImage: image,
  productImageAlt: z.string().trim().max(200),
  photoImage: image,
  photoImageAlt: z.string().trim().max(200),
  toastUrl: z
    .union([z.literal(""), z.url("Paste the full Toast link, starting with https://")])
    .transform((v) => v || null),
  toastGuid: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^[0-9a-f-]{36}$/i, "That isn’t a Toast item ID."),
    ])
    .transform((v) => v || null),
  isVisible: z.boolean(),
  inStock: z.boolean(),
  featured: z.boolean(),
});

export type ItemFormInput = z.input<typeof itemSchema>;

export type SaveItemResult =
  { ok: true; id: string } | { ok: false; message: string; fields: Record<string, string> };

export async function saveItemAction(
  id: string | null,
  input: ItemFormInput,
): Promise<SaveItemResult> {
  await requireAdmin();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Some details need a look.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  if (id && !isUuid(id)) return { ok: false, message: "That drink no longer exists.", fields: {} };
  if (data.categoryId && !(await categoryExists(data.categoryId))) data.categoryId = null;
  if (new Set(data.options.map((o) => o.id)).size !== data.options.length) {
    return { ok: false, message: "Two options share a name.", fields: {} };
  }
  if (await slugTaken(data.slug, id ?? undefined)) {
    return {
      ok: false,
      message: "Another drink already uses that web address.",
      fields: { slug: "Already used by another drink." },
    };
  }

  const values: Omit<MenuItem, "id" | "sort" | "updatedAt"> = data;
  const savedId = id ?? (await createItem(values));
  if (id) await updateItem(id, values);
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

export type UploadResult = { ok: true; image: LibraryImage } | { ok: false; message: string };

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, message: "Choose a photo first." };
  try {
    return { ok: true, image: await saveUpload(file) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Upload failed." };
  }
}

// ── Categories ─────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: slug,
  label: z.string().trim().min(2, "Name the category.").max(40),
  description: z.string().trim().max(160),
});

export async function saveCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const isNew = form.get("isNew") === "1";
  const parsed = categorySchema.safeParse({
    id: form.get("id"),
    label: form.get("label"),
    description: form.get("description") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the category details.", fields: fieldErrors(parsed.error) };
  }
  if (isNew && (await categoryExists(parsed.data.id))) {
    return { ok: false, message: "A category with that name already exists.", fields: {} };
  }
  await saveCategory(parsed.data, isNew);
  refreshSite();
  return { ok: true, message: isNew ? "Category added." : "Saved." };
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

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00.");

const hoursSchema = z.object({
  hours: z
    .array(z.object({ closed: z.boolean(), open: time, close: time }))
    .length(7)
    .refine((days) => days.every((d) => d.closed || d.close > d.open), {
      message: "Closing time must be after opening time.",
    }),
  hoursNote: z.string().trim().max(160),
});

export async function saveHoursAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const hours = Array.from({ length: 7 }, (_, d) => ({
    closed: form.get(`closed-${d}`) === "on",
    open: String(form.get(`open-${d}`) ?? "09:00"),
    close: String(form.get(`close-${d}`) ?? "14:00"),
  }));
  const parsed = hoursSchema.safeParse({ hours, hoursNote: form.get("hoursNote") ?? "" });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the hours." };
  }
  await saveSettings("store", parsed.data);
  refreshSite();
  return { ok: true, message: "Opening hours saved." };
}

const modes = ["onsite", "toast", "paused"] as const;

const orderingSchema = z.object({
  mode: z.enum(modes),
  prepMinutes: z.coerce.number().int().min(0).max(120),
  slotMinutes: z.coerce.number().int().min(5).max(60),
  daysAhead: z.coerce.number().int().min(0).max(7),
  pausedMessage: z.string().trim().min(1, "Add a message for guests.").max(240),
  pickupInstructions: z.string().trim().min(1, "Tell guests where to collect.").max(240),
});

export async function saveOrderingAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = orderingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the ordering settings.",
      fields: fieldErrors(parsed.error),
    };
  }
  await saveSettings("ordering", parsed.data);
  refreshSite();
  return { ok: true, message: "Ordering settings saved." };
}

/** One-tap switch from the overview: open, pause, or hand ordering to Toast. */
export async function setOrderingModeAction(mode: Settings["ordering"]["mode"]) {
  await requireAdmin();
  if (!modes.includes(mode)) return;
  const current = await getSettings();
  await saveSettings("ordering", { ...current.ordering, mode });
  refreshSite();
}

const announcementSchema = z.object({
  enabled: z.boolean(),
  label: z.string().trim().max(16),
  text: z.string().trim().max(140),
  href: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), {
      message: "Use a page like /menu/very-berry or a full https:// link.",
    }),
});

export async function saveAnnouncementAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse({
    enabled: form.get("enabled") === "on",
    label: form.get("label") ?? "",
    text: form.get("text") ?? "",
    href: form.get("href") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the announcement.", fields: fieldErrors(parsed.error) };
  }
  if (parsed.data.enabled && !parsed.data.text) {
    return { ok: false, message: "Add some text, or switch the bar off.", fields: {} };
  }
  await saveSettings("announcement", parsed.data);
  refreshSite();
  return { ok: true, message: "Announcement saved." };
}

const toastSchema = z.object({
  onlineOrderingUrl: z.url("Paste the full Toast ordering link, starting with https://"),
});

export async function saveToastAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = toastSchema.safeParse({ onlineOrderingUrl: form.get("onlineOrderingUrl") });
  if (!parsed.success) {
    return { ok: false, message: "Check the Toast link.", fields: fieldErrors(parsed.error) };
  }
  await saveSettings("toast", parsed.data);
  refreshSite();
  return { ok: true, message: "Toast link saved." };
}
