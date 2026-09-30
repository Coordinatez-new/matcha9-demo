"use server";

import { parseBagLines, parseOrderForm, type PlaceOrderState } from "@/lib/forms";
import type { Quote } from "@/lib/orders";
import { placeOrder, quoteBag } from "@/server/orders";

const unreadable: Quote = {
  lines: [],
  issues: [{ index: -1, message: "Your bag couldn’t be read. Please add your drinks again." }],
  subtotalCents: 0,
  itemCount: 0,
};

/** Price the guest's bag against the live menu. */
export async function quoteAction(input: unknown): Promise<Quote> {
  const lines = parseBagLines(input);
  return lines ? quoteBag(lines) : unreadable;
}

export async function placeOrderAction(input: unknown): Promise<PlaceOrderState> {
  const parsed = parseOrderForm(input);
  if (!parsed.ok) return parsed.state;
  return placeOrder(parsed.data);
}
