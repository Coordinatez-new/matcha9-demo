import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { getDb } from "./db";

/**
 * Dashboard sign-in. The owner's email and password come from the server environment
 * (ADMIN_EMAIL, ADMIN_PASSWORD). A successful sign-in stores a random session token in an
 * HttpOnly cookie; only its SHA-256 hash is kept in the database.
 */

const SESSION_DAYS = 7;

// The demo login is published in .env.example, so a live site must not accept it.
const EXAMPLE_PASSWORD = "whisk-slowly-2026";

export type AdminSetup = "ready" | "missing" | "example-password";

export function adminSetup(): AdminSetup {
  if (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD) return "missing";
  if (process.env.NODE_ENV === "production" && process.env.ADMIN_PASSWORD === EXAMPLE_PASSWORD) {
    return "example-password";
  }
  return "ready";
}

function credentials() {
  if (adminSetup() !== "ready") return null;
  return {
    email: process.env.ADMIN_EMAIL!.trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD!,
  };
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();
const sameSecret = (a: string, b: string) => timingSafeEqual(sha256(a), sha256(b));
const sessionId = (raw: string) => createHash("sha256").update(raw).digest("hex");

// A small per-address limit on failed attempts. Per server instance, which is enough to slow
// down guessing on a single-owner dashboard.
const failures = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 8;

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const creds = credentials();
  if (!creds) {
    return {
      ok: false,
      error:
        adminSetup() === "example-password"
          ? "This server still uses the example password from .env.example. Set your own ADMIN_PASSWORD first."
          : "The dashboard isn’t set up yet: add ADMIN_EMAIL and ADMIN_PASSWORD to the server.",
    };
  }

  const key = await clientKey();
  const now = Date.now();
  const record = failures.get(key);
  if (record && record.resetAt > now && record.count >= MAX_FAILURES) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  // Compare both, always, so the response time doesn't reveal which one was wrong.
  const emailOk = sameSecret(email.trim().toLowerCase(), creds.email);
  const passwordOk = sameSecret(password, creds.password);
  if (!emailOk || !passwordOk) {
    const fresh = !record || record.resetAt <= now;
    failures.set(key, {
      count: fresh ? 1 : record.count + 1,
      resetAt: fresh ? now + WINDOW_MS : record.resetAt,
    });
    return { ok: false, error: "That email and password don’t match." };
  }
  failures.delete(key);

  const raw = randomBytes(32).toString("base64url");
  const expires = new Date(now + SESSION_DAYS * 86_400_000);
  const db = await getDb();
  await db.query("delete from admin_sessions where expires_at < now()");
  await db.query("insert into admin_sessions (id, email, expires_at) values ($1, $2, $3)", [
    sessionId(raw),
    creds.email,
    expires,
  ]);
  (await cookies()).set(SESSION_COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const db = await getDb();
    await db.query("delete from admin_sessions where id = $1", [sessionId(raw)]);
  }
  jar.delete(SESSION_COOKIE);
}

/** The signed-in owner, verified against the session table, or null. */
export const getAdmin = cache(async () => {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const creds = credentials();
  if (!creds) return null;
  const db = await getDb();
  const [row] = await db.query<{ email: string }>(
    "select email from admin_sessions where id = $1 and expires_at > now()",
    [sessionId(raw)],
  );
  // Changing ADMIN_EMAIL signs out every existing session.
  if (!row || row.email !== creds.email) return null;
  return { email: row.email };
});

/** For pages and actions: the owner, or a redirect to the sign-in page. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
