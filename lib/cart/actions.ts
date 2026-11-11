"use server";

import { addQuantities, isDecimalString, normaliseQuantity } from "@/lib/money";
import { catalog } from "@/lib/repository";
import type { CartItem, Product } from "@/lib/types";
import { ensureCartId, loadCart, readCartId, saveCart } from "./server";

/**
 * Cart operations. Each returns the cart as saved in Convex, which the
 * client store then shows. Quantities are snapped to each product's rules
 * here, so whatever the browser sends, Convex only holds valid lines.
 */

const MAX_LINES = 100;

export async function getCart(): Promise<CartItem[]> {
  return loadCart(await readCartId());
}

export async function addToCart(additions: CartItem[]): Promise<CartItem[]> {
  const cartId = await ensureCartId();
  const current = await loadCart(cartId);
  const byId = await productsFor([...current, ...additions]);
  const next = [...current];
  for (const add of additions) {
    const product = byId.get(add.productId);
    if (!product?.isAvailable || !isDecimalString(add.quantity)) continue;
    const index = next.findIndex((l) => l.productId === add.productId);
    const quantity = clamp(product, index >= 0 ? addQuantities(next[index].quantity, add.quantity) : add.quantity);
    if (index >= 0) next[index] = { productId: product.id, quantity };
    else if (next.length < MAX_LINES) next.push({ productId: product.id, quantity });
  }
  await saveCart(cartId, next);
  return next;
}

export async function setCartQuantity(productId: string, quantity: string): Promise<CartItem[]> {
  const cartId = await readCartId();
  const current = await loadCart(cartId);
  if (!cartId || !isDecimalString(quantity)) return current;
  const product = (await productsFor(current)).get(productId);
  if (!product) return current;
  const next = current.map((l) => (l.productId === productId ? { productId, quantity: clamp(product, quantity) } : l));
  await saveCart(cartId, next);
  return next;
}

export async function removeFromCart(productId: string): Promise<CartItem[]> {
  const cartId = await readCartId();
  const current = await loadCart(cartId);
  if (!cartId) return current;
  const next = current.filter((l) => l.productId !== productId);
  await saveCart(cartId, next);
  return next;
}

export async function clearCart(): Promise<CartItem[]> {
  const cartId = await readCartId();
  if (cartId) await saveCart(cartId, []);
  return [];
}

async function productsFor(lines: CartItem[]): Promise<Map<string, Product>> {
  const products = await catalog.getProductsByIds(lines.map((l) => l.productId));
  return new Map(products.map((p) => [p.id, p]));
}

function clamp(product: Product, quantity: string): string {
  return normaliseQuantity(quantity, product.minimumQuantity, product.quantityStep);
}
