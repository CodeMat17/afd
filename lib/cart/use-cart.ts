"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  cartActions,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/cart/store";
import { lineTotalCents, sumCents } from "@/lib/money";

export function useCartLines() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Number of distinct products in the cart. */
export function useCartCount(): number {
  return useCartLines().length;
}

export function useCart() {
  const lines = useCartLines();
  const subtotalCents = useMemo(
    () =>
      sumCents(lines.map((l) => lineTotalCents(l.snapshot.price, l.quantity))),
    [lines],
  );
  return { lines, count: lines.length, subtotalCents, ...cartActions };
}
