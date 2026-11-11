import "server-only";

import { cookies } from "next/headers";
import type { Id } from "@/convex/_generated/dataModel";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import type { CartItem } from "@/lib/types";

/**
 * The cart lives in Convex. The browser keeps only this random, httpOnly
 * cookie so the server knows which cart is theirs; it never holds names,
 * prices or quantities.
 */
const COOKIE = "afd_cart";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

export async function readCartId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && /^[0-9a-f-]{36}$/.test(value) ? value : null;
}

/** Only call from a Server Action: it may set the cookie. */
export async function ensureCartId(): Promise<string> {
  const existing = await readCartId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}

export async function loadCart(cartId: string | null): Promise<CartItem[]> {
  if (!cartId) return [];
  return convexClient().query(api.carts.get, { serverSecret: serverSecret(), cartId });
}

export async function saveCart(cartId: string, items: CartItem[]): Promise<void> {
  await convexClient().mutation(api.carts.save, {
    serverSecret: serverSecret(),
    cartId,
    items: items.map((i) => ({ productId: i.productId as Id<"products">, quantity: i.quantity })),
  });
}
