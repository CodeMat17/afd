"use client";

/**
 * Client view of the cart stored in Convex. Nothing is persisted in the
 * browser: the list is fetched from the server on first use and every change
 * goes through a Server Action, whose reply (the cart as saved) replaces the
 * optimistic local copy.
 */
import {
  addToCart as addAction,
  clearCart as clearAction,
  getCart,
  removeFromCart as removeAction,
  setCartQuantity as setQuantityAction,
} from "@/lib/cart/actions";
import { addQuantities, normaliseQuantity, stepQuantity } from "@/lib/money";
import type { CartItem, Product } from "@/lib/types";

const EMPTY: CartItem[] = [];
/** The cart used to live in localStorage; remove any copy left behind. */
const LEGACY_STORAGE_KEY = "afd:cart";

type Listener = () => void;

let items: CartItem[] = EMPTY;
let ready = false;
let started = false;
/** Only the reply to the most recent change may overwrite local state. */
let latest = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function set(next: CartItem[]) {
  items = next;
  emit();
}

function start() {
  if (started) return;
  started = true;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage blocked; nothing to clean up.
  }
  const seq = ++latest;
  getCart()
    .then((saved) => {
      if (seq === latest) items = saved;
    })
    .catch((error) => console.error("[cart] couldn't load the cart", error))
    .finally(() => {
      ready = true;
      emit();
    });
}

/** Apply a change locally at once, then adopt whatever the server saved. */
function change(optimistic: CartItem[], request: () => Promise<CartItem[]>) {
  set(optimistic);
  const seq = ++latest;
  request()
    .then((saved) => {
      if (seq === latest) set(saved);
    })
    .catch((error) => {
      console.error("[cart] couldn't save the cart", error);
      // Re-sync with what Convex actually holds.
      getCart().then((saved) => seq === latest && set(saved)).catch(() => {});
    });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

export const getSnapshot = () => items;
export const getServerSnapshot = () => EMPTY;
export const isReady = () => ready;
export const isReadyOnServer = () => false;

export const cartActions = {
  add(product: Product, quantity: string) {
    cartActions.addMany([{ product, quantity }]);
  },
  addMany(additions: { product: Product; quantity: string }[]) {
    const next = [...items];
    for (const { product, quantity } of additions) {
      const index = next.findIndex((l) => l.productId === product.id);
      const qty = normaliseQuantity(
        index >= 0 ? addQuantities(next[index].quantity, quantity) : quantity,
        product.minimumQuantity,
        product.quantityStep,
      );
      if (index >= 0) next[index] = { productId: product.id, quantity: qty };
      else next.push({ productId: product.id, quantity: qty });
    }
    change(next, () => addAction(additions.map((a) => ({ productId: a.product.id, quantity: a.quantity }))));
  },
  setQuantity(product: Product, quantity: string) {
    const qty = normaliseQuantity(quantity, product.minimumQuantity, product.quantityStep);
    change(
      items.map((l) => (l.productId === product.id ? { ...l, quantity: qty } : l)),
      () => setQuantityAction(product.id, qty),
    );
  },
  step(product: Product, direction: 1 | -1) {
    const line = items.find((l) => l.productId === product.id);
    if (!line) return;
    cartActions.setQuantity(
      product,
      stepQuantity(line.quantity, product.minimumQuantity, product.quantityStep, direction),
    );
  },
  remove(productId: string) {
    change(
      items.filter((l) => l.productId !== productId),
      () => removeAction(productId),
    );
  },
  clear() {
    change(EMPTY, clearAction);
  },
};
