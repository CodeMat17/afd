"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import {
  cartActions,
  getServerSnapshot,
  getSnapshot,
  isReady,
  isReadyOnServer,
  subscribe,
} from "@/lib/cart/store";
import { lineTotalCents, sumCents } from "@/lib/money";
import type { Product } from "@/lib/types";

/** A cart line joined with the live catalogue: name, price and photo come from Convex. */
export interface CartLine {
  productId: string;
  quantity: string;
  product: Product;
}

export function cartLineImage(product: Product) {
  return product.images.find((i) => i.isPrimary) ?? product.images[0];
}

export function useCartLines(): CartLine[] {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { byId } = useCatalog();
  return useMemo(
    () =>
      items.flatMap((item) => {
        const product = byId.get(item.productId);
        return product ? [{ ...item, product }] : [];
      }),
    [items, byId],
  );
}

/** False until the cart has been fetched from the server. */
export function useCartReady(): boolean {
  return useSyncExternalStore(subscribe, isReady, isReadyOnServer);
}

/** Number of distinct products in the cart. */
export function useCartCount(): number {
  return useCartLines().length;
}

export function useCart() {
  const lines = useCartLines();
  const ready = useCartReady();
  const subtotalCents = useMemo(
    () => sumCents(lines.map((l) => lineTotalCents(l.product.price, l.quantity))),
    [lines],
  );
  return { lines, ready, count: lines.length, subtotalCents, ...cartActions };
}
