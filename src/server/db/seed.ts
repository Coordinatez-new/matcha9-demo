import "server-only";
import { starterCategories, starterItems } from "@/content/menu";
import { defaultSettings } from "@/lib/settings";
import type { Queryable } from "./index";

/** Data migration: the starting categories and menu. Runs once per database. */
export async function seedMenu(tx: Queryable) {
  for (const c of starterCategories) {
    await tx.query(
      "insert into categories (id, label, description, sort) values ($1, $2, $3, $4) on conflict (id) do nothing",
      [c.id, c.label, c.description, c.sort],
    );
  }
  for (const item of starterItems()) {
    await tx.query(
      `insert into menu_items (
         slug, name, price_cents, category_id, badge, tagline, description, components,
         ingredients, options, product_image, product_image_alt, photo_image, photo_image_alt,
         toast_url, toast_guid, featured, sort
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       on conflict (slug) do nothing`,
      [
        item.slug,
        item.name,
        item.priceCents,
        item.categoryId,
        item.badge,
        item.tagline,
        item.description,
        JSON.stringify(item.components),
        item.ingredients ? JSON.stringify(item.ingredients) : null,
        JSON.stringify(item.options),
        JSON.stringify(item.productImage),
        item.productImageAlt,
        JSON.stringify(item.photoImage),
        item.photoImageAlt,
        item.toastUrl,
        item.toastGuid,
        item.featured,
        item.sort,
      ],
    );
  }
}

/** Make sure every settings group exists; values the admin has saved are left alone. */
export async function ensureSettings(db: Queryable) {
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.query(
      "insert into settings (key, value) values ($1, $2) on conflict (key) do nothing",
      [key, JSON.stringify(value)],
    );
  }
}
