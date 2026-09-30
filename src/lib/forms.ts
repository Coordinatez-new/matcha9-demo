import { z } from "zod";
import type { LibraryImage } from "./menu";
import { orderLimits, type BagLineInput, type PlaceOrderInput } from "./orders";
import type {
  AnnouncementSettings,
  OrderingSettings,
  StoreSettings,
  ToastSettings,
} from "./settings";

/**
 * Validation for every form on the site: the checkout and the dashboard. Shared by the
 * server actions and the in-browser demo, so both accept and reject exactly the same input.
 */

export type FormState = { ok: boolean; message: string; fields?: Record<string, string> } | null;

export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fields[key] ??= issue.message;
  }
  return fields;
}

// ── Checkout ───────────────────────────────────────────────────────────────

const id = z.string().trim().max(64);

const bagLines = z
  .array(
    z.object({
      itemId: id,
      quantity: z.number().int().min(1).max(orderLimits.quantity),
      selections: z.record(id, z.array(id).max(20)),
    }),
  )
  .max(orderLimits.lines);

/** The bag as the browser sent it, or null if it can't be read. */
export function parseBagLines(input: unknown): BagLineInput[] | null {
  const parsed = bagLines.safeParse(input);
  return parsed.success ? parsed.data : null;
}

const orderForm = z.object({
  lines: bagLines.min(1, "Your bag is empty."),
  name: z.string().trim().min(2, "Please add the name for the order.").max(60),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Please add a phone number we can reach you on."),
  email: z.union([z.literal(""), z.email("That email doesn’t look right.")]).default(""),
  notes: z.string().trim().max(240, "Please keep notes under 240 characters.").default(""),
  pickup: z.string().trim().min(1, "Please choose a pickup time.").max(40),
  // Honeypot: a hidden field people never fill in.
  website: z.string().max(0).default(""),
});

export type PlaceOrderState =
  | { ok: true; publicId: string }
  | { ok: false; error: string; fields?: Partial<Record<string, string>> };

export function parseOrderForm(
  input: unknown,
): { ok: true; data: PlaceOrderInput } | { ok: false; state: PlaceOrderState } {
  const parsed = orderForm.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues)
      fields[String(issue.path[0] ?? "form")] ??= issue.message;
    if (fields.website) {
      return { ok: false, state: { ok: false, error: "Something went wrong. Please try again." } };
    }
    return {
      ok: false,
      state: { ok: false, error: fields.lines ?? "Please check the highlighted details.", fields },
    };
  }
  const { lines, name, phone, email, notes, pickup } = parsed.data;
  return {
    ok: true,
    data: { lines, name, phone, email: email || null, notes: notes || null, pickup },
  };
}

// ── Menu items ─────────────────────────────────────────────────────────────

const slug = z
  .string()
  .trim()
  .min(1, "Add a web address.")
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only.");

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

/**
 * A drink as the editor sends it. Photos come from the library: files that ship with the site
 * or uploads (served from /media on the server, kept as data URLs in the browser demo).
 */
export function itemSchema({ allowDataUrls = false } = {}) {
  const image = z
    .object({
      src: z
        .string()
        .refine(
          (src) =>
            /^\/(images|media)\/[\w./-]+$/.test(src) ||
            (allowDataUrls && /^data:image\/(webp|jpeg|png);base64,[\w+/=]+$/.test(src)),
          "Pick an image from the library.",
        ),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable();

  return z.object({
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
}

export type ItemFormInput = z.input<ReturnType<typeof itemSchema>>;
export type ItemFormData = z.output<ReturnType<typeof itemSchema>>;

export type SaveItemResult =
  { ok: true; id: string } | { ok: false; message: string; fields: Record<string, string> };

export function parseItemForm(
  input: unknown,
  options?: { allowDataUrls?: boolean },
): { ok: true; data: ItemFormData } | { ok: false; result: SaveItemResult } {
  const parsed = itemSchema(options).safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      result: {
        ok: false,
        message: "Some details need a look.",
        fields: fieldErrors(parsed.error),
      },
    };
  }
  if (new Set(parsed.data.options.map((o) => o.id)).size !== parsed.data.options.length) {
    return { ok: false, result: { ok: false, message: "Two options share a name.", fields: {} } };
  }
  return { ok: true, data: parsed.data };
}

export type UploadResult = { ok: true; image: LibraryImage } | { ok: false; message: string };

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// ── Categories ─────────────────────────────────────────────────────────────

const categoryForm = z.object({
  id: slug,
  label: z.string().trim().min(2, "Name the category.").max(40),
  description: z.string().trim().max(160),
});

export function parseCategoryForm(
  form: FormData,
):
  | { ok: true; isNew: boolean; data: z.output<typeof categoryForm> }
  | { ok: false; state: FormState } {
  const parsed = categoryForm.safeParse({
    id: form.get("id"),
    label: form.get("label"),
    description: form.get("description") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "Check the category details.",
        fields: fieldErrors(parsed.error),
      },
    };
  }
  return { ok: true, isNew: form.get("isNew") === "1", data: parsed.data };
}

// ── Settings ───────────────────────────────────────────────────────────────

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00.");

const hoursForm = z.object({
  hours: z
    .array(z.object({ closed: z.boolean(), open: time, close: time }))
    .length(7)
    .refine((days) => days.every((d) => d.closed || d.close > d.open), {
      message: "Closing time must be after opening time.",
    }),
  hoursNote: z.string().trim().max(160),
});

export function parseHoursForm(
  form: FormData,
): { ok: true; data: StoreSettings } | { ok: false; state: FormState } {
  const hours = Array.from({ length: 7 }, (_, d) => ({
    closed: form.get(`closed-${d}`) === "on",
    open: String(form.get(`open-${d}`) ?? "09:00"),
    close: String(form.get(`close-${d}`) ?? "14:00"),
  }));
  const parsed = hoursForm.safeParse({ hours, hoursNote: form.get("hoursNote") ?? "" });
  if (!parsed.success) {
    return {
      ok: false,
      state: { ok: false, message: parsed.error.issues[0]?.message ?? "Check the hours." },
    };
  }
  return { ok: true, data: parsed.data };
}

export const orderingModes = ["onsite", "toast", "paused"] as const;

const orderingForm = z.object({
  mode: z.enum(orderingModes),
  prepMinutes: z.coerce.number().int().min(0).max(120),
  slotMinutes: z.coerce.number().int().min(5).max(60),
  daysAhead: z.coerce.number().int().min(0).max(7),
  pausedMessage: z.string().trim().min(1, "Add a message for guests.").max(240),
  pickupInstructions: z.string().trim().min(1, "Tell guests where to collect.").max(240),
});

export function parseOrderingForm(
  form: FormData,
): { ok: true; data: OrderingSettings } | { ok: false; state: FormState } {
  const parsed = orderingForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "Check the ordering settings.",
        fields: fieldErrors(parsed.error),
      },
    };
  }
  return { ok: true, data: parsed.data };
}

const announcementForm = z.object({
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

export function parseAnnouncementForm(
  form: FormData,
): { ok: true; data: AnnouncementSettings } | { ok: false; state: FormState } {
  const parsed = announcementForm.safeParse({
    enabled: form.get("enabled") === "on",
    label: form.get("label") ?? "",
    text: form.get("text") ?? "",
    href: form.get("href") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      state: { ok: false, message: "Check the announcement.", fields: fieldErrors(parsed.error) },
    };
  }
  if (parsed.data.enabled && !parsed.data.text) {
    return {
      ok: false,
      state: { ok: false, message: "Add some text, or switch the bar off.", fields: {} },
    };
  }
  return { ok: true, data: parsed.data };
}

const toastForm = z.object({
  onlineOrderingUrl: z.url("Paste the full Toast ordering link, starting with https://"),
});

export function parseToastForm(
  form: FormData,
): { ok: true; data: ToastSettings } | { ok: false; state: FormState } {
  const parsed = toastForm.safeParse({ onlineOrderingUrl: form.get("onlineOrderingUrl") });
  if (!parsed.success) {
    return {
      ok: false,
      state: { ok: false, message: "Check the Toast link.", fields: fieldErrors(parsed.error) },
    };
  }
  return { ok: true, data: parsed.data };
}
