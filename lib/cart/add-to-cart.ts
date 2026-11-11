"use client";

import { cartActions } from "@/lib/cart/store";
import type { Product } from "@/lib/types";
import { overlay } from "@/lib/ui-store";

/** Adds to the cart (saved in Convex) and opens the mini-cart drawer as confirmation. */
export function addToCart(product: Product, quantity: string) {
  cartActions.add(product, quantity);
  overlay.open("cart", { addedId: product.id });
}
