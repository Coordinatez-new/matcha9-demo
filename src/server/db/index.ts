import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { migrate } from "./migrations";
import { ensureSettings } from "./seed";

/**
 * One Postgres interface, two engines:
 * - `DATABASE_URL` set: a regular Postgres server (Neon, Supabase, Railway, RDS…) through `pg`.
 * - Not set: an embedded Postgres (PGlite) stored in `.data/pglite`, so the site runs locally
 *   and on any single Node server with no database to provision. Needs a persistent disk.
 */

export type Row = Record<string, unknown>;

export interface Queryable {
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Run several statements (no parameters), e.g. a migration. */
  exec(sql: string): Promise<void>;
}

export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  readonly engine: "postgres" | "pglite";
}

async function connectPostgres(connectionString: string): Promise<Database> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
  return {
    engine: "postgres",
    async query<T extends Row>(sql: string, params: unknown[] = []) {
      return (await pool.query(sql, params)).rows as T[];
    },
    async exec(sql) {
      await pool.query(sql);
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await fn({
          async query<T extends Row>(sql: string, params: unknown[] = []) {
            return (await client.query(sql, params)).rows as T[];
          },
          async exec(sql) {
            await client.query(sql);
          },
        });
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function connectPglite(): Promise<Database> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  await pg.waitReady;
  return {
    engine: "pglite",
    async query<T extends Row>(sql: string, params: unknown[] = []) {
      return (await pg.query<T>(sql, params)).rows;
    },
    async exec(sql) {
      await pg.exec(sql);
    },
    async transaction(fn) {
      return pg.transaction((tx) =>
        fn({
          async query<T extends Row>(sql: string, params: unknown[] = []) {
            return (await tx.query<T>(sql, params)).rows;
          },
          async exec(sql) {
            await tx.exec(sql);
          },
        }),
      );
    },
  };
}

async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  const database = url ? await connectPostgres(url) : await connectPglite();
  await migrate(database);
  await ensureSettings(database);
  return database;
}

// Kept on globalThis so dev-server reloads reuse one connection (PGlite allows one per folder).
const holder = globalThis as unknown as { __matcha9Db?: Promise<Database> };

export function getDb(): Promise<Database> {
  holder.__matcha9Db ??= connect().catch((error) => {
    holder.__matcha9Db = undefined;
    throw error;
  });
  return holder.__matcha9Db;
}
