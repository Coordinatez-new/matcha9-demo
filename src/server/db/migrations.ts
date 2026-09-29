import "server-only";
import type { Database, Queryable } from "./index";
import { seedMenu } from "./seed";

/**
 * Schema and data changes, applied in order and recorded in `schema_migrations`. Never edit a
 * migration that has shipped; add a new one instead.
 */
const migrations: { id: number; name: string; up: (tx: Queryable) => Promise<void> }[] = [
  {
    id: 1,
    name: "initial schema",
    up: (tx) =>
      tx.exec(/* sql */ `
      create table categories (
        id text primary key,
        label text not null,
        description text not null default '',
        sort integer not null default 0,
        created_at timestamptz not null default now()
      );

      create table menu_items (
        id uuid primary key default gen_random_uuid(),
        slug text not null unique,
        name text not null,
        price_cents integer not null check (price_cents >= 0),
        category_id text references categories (id) on update cascade on delete set null,
        badge text,
        tagline text not null default '',
        description text not null default '',
        components jsonb not null default '[]'::jsonb,
        ingredients jsonb,
        options jsonb not null default '[]'::jsonb,
        product_image jsonb,
        product_image_alt text not null default '',
        photo_image jsonb,
        photo_image_alt text not null default '',
        toast_url text,
        toast_guid text,
        is_visible boolean not null default true,
        in_stock boolean not null default true,
        featured boolean not null default false,
        sort integer not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index menu_items_sort_idx on menu_items (sort, name);

      create table media (
        id uuid primary key default gen_random_uuid(),
        filename text not null,
        content_type text not null,
        width integer not null,
        height integer not null,
        size integer not null,
        data bytea not null,
        created_at timestamptz not null default now()
      );

      create table settings (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      );

      create table orders (
        id uuid primary key default gen_random_uuid(),
        -- Ticket number shown to guests and staff; assigned in order, without gaps.
        number integer not null unique,
        public_id text not null unique,
        status text not null default 'received'
          check (status in ('received', 'preparing', 'ready', 'picked_up', 'cancelled')),
        customer_name text not null,
        customer_phone text not null,
        customer_email text,
        notes text,
        pickup_at timestamptz not null,
        pickup_asap boolean not null default false,
        subtotal_cents integer not null,
        item_count integer not null,
        toast_status text not null default 'not_connected'
          check (toast_status in ('not_connected', 'pending', 'sent', 'failed')),
        toast_reference text,
        toast_error text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index orders_created_idx on orders (created_at desc);
      create index orders_status_idx on orders (status);

      create table order_items (
        id uuid primary key default gen_random_uuid(),
        order_id uuid not null references orders (id) on delete cascade,
        menu_item_id uuid references menu_items (id) on delete set null,
        name text not null,
        options jsonb not null default '[]'::jsonb,
        unit_price_cents integer not null,
        quantity integer not null check (quantity > 0),
        line_total_cents integer not null,
        position integer not null default 0
      );
      create index order_items_order_idx on order_items (order_id);

      create table order_events (
        id bigserial primary key,
        order_id uuid not null references orders (id) on delete cascade,
        status text not null,
        note text,
        created_at timestamptz not null default now()
      );
      create index order_events_order_idx on order_events (order_id, created_at);

      create table admin_sessions (
        id text primary key,
        email text not null,
        expires_at timestamptz not null,
        created_at timestamptz not null default now()
      );
    `),
  },
  { id: 2, name: "starting menu", up: seedMenu },
];

export async function migrate(db: Database) {
  await db.transaction(async (tx) => {
    // Serialise concurrent boots (several serverless instances) on the same database.
    await tx.query("select pg_advisory_xact_lock(90909)");
    await tx.exec(`
      create table if not exists schema_migrations (
        id integer primary key,
        name text not null,
        applied_at timestamptz not null default now()
      )
    `);
    const applied = new Set(
      (await tx.query<{ id: number }>("select id from schema_migrations")).map((r) => r.id),
    );
    for (const m of migrations) {
      if (applied.has(m.id)) continue;
      await m.up(tx);
      await tx.query("insert into schema_migrations (id, name) values ($1, $2)", [m.id, m.name]);
    }
  });
}
