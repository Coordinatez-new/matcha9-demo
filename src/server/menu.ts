import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import type { Category, ImageRef, Ingredients, MenuItem, OptionGroup } from "@/lib/menu";
import { getDb, type Queryable } from "./db";

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  category_id: string | null;
  badge: string | null;
  tagline: string;
  description: string;
  components: string[];
  ingredients: Ingredients | null;
  options: OptionGroup[];
  product_image: ImageRef | null;
  product_image_alt: string;
  photo_image: ImageRef | null;
  photo_image_alt: string;
  toast_url: string | null;
  toast_guid: string | null;
  is_visible: boolean;
  in_stock: boolean;
  featured: boolean;
  sort: number;
  updated_at: Date | string;
};

function toItem(r: ItemRow): MenuItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceCents: r.price_cents,
    categoryId: r.category_id,
    badge: r.badge,
    tagline: r.tagline,
    description: r.description,
    components: r.components ?? [],
    ingredients: r.ingredients,
    options: r.options ?? [],
    productImage: r.product_image,
    productImageAlt: r.product_image_alt,
    photoImage: r.photo_image,
    photoImageAlt: r.photo_image_alt,
    toastUrl: r.toast_url,
    toastGuid: r.toast_guid,
    isVisible: r.is_visible,
    inStock: r.in_stock,
    featured: r.featured,
    sort: r.sort,
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

type CategoryRow = { id: string; label: string; description: string; sort: number };

const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  label: r.label,
  description: r.description,
  sort: r.sort,
});

const itemOrder = "order by sort asc, name asc";

async function listItems(db: Queryable, visibleOnly: boolean) {
  const rows = await db.query<ItemRow>(
    `select * from menu_items ${visibleOnly ? "where is_visible" : ""} ${itemOrder}`,
  );
  return rows.map(toItem);
}

async function listCategories(db: Queryable) {
  const rows = await db.query<CategoryRow>(
    "select id, label, description, sort from categories order by sort asc, label asc",
  );
  return rows.map(toCategory);
}

/** The menu guests see: visible items (in stock or not) and the categories that have any. */
export const getPublicMenu = cache(async () => {
  await connection();
  const db = await getDb();
  const [items, allCategories] = await Promise.all([listItems(db, true), listCategories(db)]);
  const used = new Set(items.map((i) => i.categoryId));
  return { items, categories: allCategories.filter((c) => used.has(c.id)) };
});

export const getPublicItem = cache(async (slug: string) => {
  await connection();
  const db = await getDb();
  const [row] = await db.query<ItemRow>("select * from menu_items where slug = $1 and is_visible", [
    slug,
  ]);
  return row ? toItem(row) : null;
});

/** Everything, hidden items included, for the dashboard. */
export async function getAdminMenu() {
  const db = await getDb();
  const [items, categories] = await Promise.all([listItems(db, false), listCategories(db)]);
  return { items, categories };
}

export async function getItemById(id: string) {
  const db = await getDb();
  const [row] = await db.query<ItemRow>("select * from menu_items where id = $1", [id]);
  return row ? toItem(row) : null;
}

export async function getItemsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const db = await getDb();
  const rows = await db.query<ItemRow>("select * from menu_items where id = any($1::uuid[])", [
    ids,
  ]);
  return rows.map(toItem);
}

export async function getCategories() {
  return listCategories(await getDb());
}

export type ItemInput = Omit<MenuItem, "id" | "sort" | "updatedAt">;

const columns = (input: ItemInput) => [
  input.slug,
  input.name,
  input.priceCents,
  input.categoryId,
  input.badge,
  input.tagline,
  input.description,
  JSON.stringify(input.components),
  input.ingredients ? JSON.stringify(input.ingredients) : null,
  JSON.stringify(input.options),
  input.productImage ? JSON.stringify(input.productImage) : null,
  input.productImageAlt,
  input.photoImage ? JSON.stringify(input.photoImage) : null,
  input.photoImageAlt,
  input.toastUrl,
  input.toastGuid,
  input.isVisible,
  input.inStock,
  input.featured,
];

export async function slugTaken(slug: string, exceptId?: string) {
  const db = await getDb();
  const rows = await db.query("select 1 from menu_items where slug = $1 and id <> $2", [
    slug,
    exceptId ?? "00000000-0000-0000-0000-000000000000",
  ]);
  return rows.length > 0;
}

export async function createItem(input: ItemInput) {
  const db = await getDb();
  const [row] = await db.query<{ id: string }>(
    `insert into menu_items (
       slug, name, price_cents, category_id, badge, tagline, description, components,
       ingredients, options, product_image, product_image_alt, photo_image, photo_image_alt,
       toast_url, toast_guid, is_visible, in_stock, featured, sort
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
       $19, (select coalesce(max(sort), -1) + 1 from menu_items))
     returning id`,
    columns(input),
  );
  return row!.id;
}

export async function updateItem(id: string, input: ItemInput) {
  const db = await getDb();
  await db.query(
    `update menu_items set
       slug = $1, name = $2, price_cents = $3, category_id = $4, badge = $5, tagline = $6,
       description = $7, components = $8, ingredients = $9, options = $10, product_image = $11,
       product_image_alt = $12, photo_image = $13, photo_image_alt = $14, toast_url = $15,
       toast_guid = $16, is_visible = $17, in_stock = $18, featured = $19, updated_at = now()
     where id = $20`,
    [...columns(input), id],
  );
}

export async function setItemFlag(
  id: string,
  flag: "in_stock" | "is_visible" | "featured",
  value: boolean,
) {
  const db = await getDb();
  // `flag` is one of three fixed column names, never user input.
  await db.query(`update menu_items set ${flag} = $1, updated_at = now() where id = $2`, [
    value,
    id,
  ]);
}

/** Swap an item with its neighbour in the menu order. */
export async function moveItem(id: string, direction: -1 | 1) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const rows = await tx.query<{ id: string }>(`select id from menu_items ${itemOrder}`);
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const moved = ids[from]!;
    ids[from] = ids[to]!;
    ids[to] = moved;
    for (const [sort, itemId] of ids.entries()) {
      await tx.query("update menu_items set sort = $1 where id = $2", [sort, itemId]);
    }
  });
}

export async function deleteItem(id: string) {
  const db = await getDb();
  await db.query("delete from menu_items where id = $1", [id]);
}

export async function saveCategory(category: Omit<Category, "sort">, isNew: boolean) {
  const db = await getDb();
  if (isNew) {
    await db.query(
      `insert into categories (id, label, description, sort)
       values ($1, $2, $3, (select coalesce(max(sort), -1) + 1 from categories))`,
      [category.id, category.label, category.description],
    );
  } else {
    await db.query("update categories set label = $2, description = $3 where id = $1", [
      category.id,
      category.label,
      category.description,
    ]);
  }
}

export async function categoryExists(id: string) {
  const db = await getDb();
  return (await db.query("select 1 from categories where id = $1", [id])).length > 0;
}

export async function moveCategory(id: string, direction: -1 | 1) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const ids = (
      await tx.query<{ id: string }>("select id from categories order by sort asc, label asc")
    ).map((r) => r.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const moved = ids[from]!;
    ids[from] = ids[to]!;
    ids[to] = moved;
    for (const [sort, categoryId] of ids.entries()) {
      await tx.query("update categories set sort = $1 where id = $2", [sort, categoryId]);
    }
  });
}

/** Items in a deleted category stay on the menu, uncategorised. */
export async function deleteCategory(id: string) {
  const db = await getDb();
  await db.query("delete from categories where id = $1", [id]);
}
