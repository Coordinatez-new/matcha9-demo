"use server";

import { z } from "zod";
import { orderLimits } from "@/lib/orders";
import { placeOrder, quoteBag, type Quote } from "@/server/orders";

const id = z.string().trim().max(64);
const lines = z
  .array(
    z.object({
      itemId: id,
      quantity: z.number().int().min(1).max(orderLimits.quantity),
      selections: z.record(id, z.array(id).max(20)),
    }),
  )
  .max(orderLimits.lines);

/** Price the guest's bag against the live menu. */
export async function quoteAction(input: unknown): Promise<Quote> {
  const parsed = lines.safeParse(input);
  if (!parsed.success) {
    return {
      lines: [],
      issues: [{ index: -1, message: "Your bag couldn’t be read. Please add your drinks again." }],
      subtotalCents: 0,
      itemCount: 0,
    };
  }
  return quoteBag(parsed.data);
}

const order = z.object({
  lines: lines.min(1, "Your bag is empty."),
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

export async function placeOrderAction(input: unknown): Promise<PlaceOrderState> {
  const parsed = order.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    if (fields.website) return { ok: false, error: "Something went wrong. Please try again." };
    return { ok: false, error: fields.lines ?? "Please check the highlighted details.", fields };
  }
  const { name, phone, email, notes, pickup } = parsed.data;
  return placeOrder({
    lines: parsed.data.lines,
    name,
    phone,
    email: email || null,
    notes: notes || null,
    pickup,
  });
}
