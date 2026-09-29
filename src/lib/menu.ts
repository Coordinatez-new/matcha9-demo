/**
 * Menu types and pricing rules shared by the storefront, the bag and the server.
 * Prices are integer cents everywhere; format them only for display.
 */

export type ImageRef = { src: string; width: number; height: number };

export type OptionChoice = { id: string; label: string; priceCents: number };

export type OptionGroup = {
  id: string;
  /** Shown to guests, e.g. "Serve" or "Base". */
  name: string;
  /** `single` renders as a radio group, `multi` as checkboxes. */
  type: "single" | "multi";
  /** A required single choice always resolves to a value (the default, or the first choice). */
  required: boolean;
  defaultChoiceId: string | null;
  choices: OptionChoice[];
};

export type Ingredients = {
  lede: string;
  groups: { title: string; items: string }[];
  contains: string;
};

export type Category = { id: string; label: string; description: string; sort: number };

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  categoryId: string | null;
  badge: string | null;
  tagline: string;
  description: string;
  /** The official menu line, e.g. ["Pure Matcha", "Milk or Water", "Hot or Iced"]. */
  components: string[];
  ingredients: Ingredients | null;
  options: OptionGroup[];
  productImage: ImageRef | null;
  productImageAlt: string;
  photoImage: ImageRef | null;
  photoImageAlt: string;
  /** Item page on the Toast online ordering site (used when ordering is handed to Toast). */
  toastUrl: string | null;
  /** Toast menu item GUID, for sending website orders to the Toast POS. */
  toastGuid: string | null;
  isVisible: boolean;
  inStock: boolean;
  featured: boolean;
  sort: number;
  updatedAt: string;
};

/** The parts of a menu item the storefront needs to put it in the bag. */
export type OrderableItem = Pick<
  MenuItem,
  | "id"
  | "slug"
  | "name"
  | "priceCents"
  | "options"
  | "productImage"
  | "photoImage"
  | "productImageAlt"
  | "inStock"
>;

export function toOrderable(item: MenuItem): OrderableItem {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    priceCents: item.priceCents,
    options: item.options,
    productImage: item.productImage,
    photoImage: item.photoImage,
    productImageAlt: item.productImageAlt,
    inStock: item.inStock,
  };
}

/** What a guest picked for one option group, in the shape the bag and orders store. */
export type SelectedOption = {
  groupId: string;
  group: string;
  choiceId: string;
  choice: string;
  priceCents: number;
};

/** Raw selections from a form or the bag: group id → chosen choice ids. */
export type SelectionInput = Record<string, string[]>;

export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

const words = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

/** "Nine" for 9, for headlines like "Nine drinks, one standard". Numerals past twelve. */
export function countWord(n: number): string {
  return words[n] ?? String(n);
}

/** "No. 01" style label used on cards. */
export function menuNumber(index: number): string {
  return `No. ${String(index + 1).padStart(2, "0")}`;
}

/** The default selections for an item: each required single group's default choice. */
export function defaultSelections(item: Pick<MenuItem, "options">): SelectionInput {
  const input: SelectionInput = {};
  for (const group of item.options) {
    const fallback = group.defaultChoiceId ?? (group.required ? group.choices[0]?.id : undefined);
    if (group.type === "single" && fallback) input[group.id] = [fallback];
  }
  return input;
}

type Resolved =
  { ok: true; selections: SelectedOption[]; unitPriceCents: number } | { ok: false; error: string };

/**
 * Validate a guest's choices against the item's option groups and price one unit.
 * Unknown groups and choices are ignored; a required single group falls back to its default.
 */
export function resolveSelections(
  item: Pick<MenuItem, "name" | "priceCents" | "options">,
  input: SelectionInput,
): Resolved {
  const selections: SelectedOption[] = [];
  for (const group of item.options) {
    const valid = new Set(group.choices.map((c) => c.id));
    let picked = [...new Set(input[group.id] ?? [])].filter((id) => valid.has(id));

    if (group.type === "single") {
      if (picked.length > 1) picked = picked.slice(0, 1);
      if (picked.length === 0 && group.required) {
        const fallback = group.defaultChoiceId ?? group.choices[0]?.id;
        if (!fallback) return { ok: false, error: `${item.name}: choose a ${group.name}.` };
        picked = [fallback];
      }
    }

    for (const id of picked) {
      const choice = group.choices.find((c) => c.id === id)!;
      selections.push({
        groupId: group.id,
        group: group.name,
        choiceId: choice.id,
        choice: choice.label,
        priceCents: choice.priceCents,
      });
    }
  }
  const unitPriceCents = item.priceCents + selections.reduce((sum, s) => sum + s.priceCents, 0);
  return { ok: true, selections, unitPriceCents };
}

/** "Iced · Milk" style summary of picked options. */
export function describeSelections(selections: Pick<SelectedOption, "choice">[]): string {
  return selections.map((s) => s.choice).join(" · ");
}

/** A stable key for "same drink, same options" so the bag can merge identical lines. */
export function lineKey(itemId: string, input: SelectionInput): string {
  const parts = Object.keys(input)
    .sort()
    .map((g) => `${g}:${[...(input[g] ?? [])].sort().join(",")}`);
  return `${itemId}|${parts.join(";")}`;
}

/** URL-safe slug from a name: "Cinnamon Matcha Melt" → "cinnamon-matcha-melt". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
