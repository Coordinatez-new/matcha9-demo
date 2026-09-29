import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { defaultSettings, type Settings } from "@/lib/settings";
import { getDb } from "./db";

/** Saved settings over the defaults, so fields added later always have a value. */
export const getSettings = cache(async (): Promise<Settings> => {
  await connection();
  const db = await getDb();
  const rows = await db.query<{ key: string; value: unknown }>("select key, value from settings");
  const saved = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<Settings>;
  return {
    store: { ...defaultSettings.store, ...saved.store },
    ordering: { ...defaultSettings.ordering, ...saved.ordering },
    announcement: { ...defaultSettings.announcement, ...saved.announcement },
    toast: { ...defaultSettings.toast, ...saved.toast },
  };
});

export async function saveSettings<K extends keyof Settings>(key: K, value: Settings[K]) {
  const db = await getDb();
  await db.query(
    `insert into settings (key, value, updated_at) values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}
