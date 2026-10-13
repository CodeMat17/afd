/**
 * Local cart prototype. Persists product IDs and quantities (plus a display
 * snapshot) in localStorage. It is NOT a trusted order or inventory record.
 */
import {
  addQuantities,
  isDecimalString,
  normaliseQuantity,
  stepQuantity,
} from "@/lib/money";
import type { CartLineSnapshot, Product, StoredCartLine } from "@/lib/types";

const STORAGE_KEY = "afd:cart";
const STORAGE_VERSION = 1;
const UNITS = new Set(["piece", "metre", "yard"]);
const EMPTY: StoredCartLine[] = [];

type Listener = () => void;

let lines: StoredCartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<Listener>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function parseSnapshot(value: unknown): CartLineSnapshot | null {
  if (!isRecord(value)) return null;
  const name = readString(value, "name");
  const slug = readString(value, "slug");
  const sku = readString(value, "sku");
  const price = readString(value, "price");
  const unit = readString(value, "unit");
  const minimumQuantity = readString(value, "minimumQuantity");
  const quantityStep = readString(value, "quantityStep");
  const imageUrl = readString(value, "imageUrl");
  const altText = readString(value, "altText");
  if (
    !name || !slug || !sku || !price || !unit || !minimumQuantity ||
    !quantityStep || imageUrl === null || altText === null
  ) {
    return null;
  }
  if (
    !isDecimalString(price) ||
    !isDecimalString(minimumQuantity) ||
    !isDecimalString(quantityStep) ||
    !UNITS.has(unit) ||
    !imageUrl.startsWith("/")
  ) {
    return null;
  }
  return {
    name,
    slug,
    sku,
    price,
    unit: unit as CartLineSnapshot["unit"],
    minimumQuantity,
    quantityStep,
    imageUrl,
    altText,
  };
}

function parseLine(value: unknown): StoredCartLine | null {
  if (!isRecord(value)) return null;
  const productId = readString(value, "productId");
  const quantity = readString(value, "quantity");
  const snapshot = parseSnapshot(value.snapshot);
  if (!productId || !quantity || !snapshot || !isDecimalString(quantity)) {
    return null;
  }
  return {
    productId,
    quantity: normaliseQuantity(
      quantity,
      snapshot.minimumQuantity,
      snapshot.quantityStep,
    ),
    snapshot,
  };
}

/** Validate persisted JSON. Anything unexpected is discarded, never trusted. */
export function parseStoredCart(raw: string | null): StoredCartLine[] {
  if (!raw) return EMPTY;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!isRecord(data) || data.version !== STORAGE_VERSION) return EMPTY;
  if (!Array.isArray(data.lines)) return EMPTY;
  const seen = new Set<string>();
  const result: StoredCartLine[] = [];
  for (const entry of data.lines) {
    const line = parseLine(entry);
    if (line && !seen.has(line.productId)) {
      seen.add(line.productId);
      result.push(line);
    }
  }
  return result;
}

function load() {
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    lines = parseStoredCart(raw);
    if (raw && lines.length === 0) {
      // Incompatible or corrupt data: clear it safely.
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    lines = EMPTY;
  }
}

function commit(next: StoredCartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, lines: next }),
    );
  } catch {
    // Storage unavailable (private mode, quota). Cart still works in memory.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  load();
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): StoredCartLine[] {
  if (!loaded) load();
  return lines;
}

export function getServerSnapshot(): StoredCartLine[] {
  return EMPTY;
}

export function snapshotFromProduct(product: Product): CartLineSnapshot {
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    unit: product.unit,
    minimumQuantity: product.minimumQuantity,
    quantityStep: product.quantityStep,
    imageUrl: image?.imageUrl ?? "",
    altText: image?.altText ?? product.name,
  };
}

export const cartActions = {
  add(product: Product, quantity: string) {
    const current = getSnapshot();
    const snapshot = snapshotFromProduct(product);
    const existing = current.find((l) => l.productId === product.id);
    const nextQuantity = normaliseQuantity(
      existing ? addQuantities(existing.quantity, quantity) : quantity,
      product.minimumQuantity,
      product.quantityStep,
    );
    const nextLine: StoredCartLine = {
      productId: product.id,
      quantity: nextQuantity,
      snapshot,
    };
    commit(
      existing
        ? current.map((l) => (l.productId === product.id ? nextLine : l))
        : [...current, nextLine],
    );
  },
  setQuantity(productId: string, quantity: string) {
    commit(
      getSnapshot().map((l) =>
        l.productId === productId
          ? {
              ...l,
              quantity: normaliseQuantity(
                quantity,
                l.snapshot.minimumQuantity,
                l.snapshot.quantityStep,
              ),
            }
          : l,
      ),
    );
  },
  step(productId: string, direction: 1 | -1) {
    commit(
      getSnapshot().map((l) =>
        l.productId === productId
          ? {
              ...l,
              quantity: stepQuantity(
                l.quantity,
                l.snapshot.minimumQuantity,
                l.snapshot.quantityStep,
                direction,
              ),
            }
          : l,
      ),
    );
  },
  remove(productId: string) {
    commit(getSnapshot().filter((l) => l.productId !== productId));
  },
  clear() {
    commit(EMPTY);
  },
  /** Refresh snapshots from the current catalogue (prices, names, rules). */
  reconcile(products: Product[]) {
    const byId = new Map(products.map((p) => [p.id, p]));
    const current = getSnapshot();
    let changed = false;
    const next = current.map((line) => {
      const product = byId.get(line.productId);
      if (!product) return line;
      const snapshot = snapshotFromProduct(product);
      const quantity = normaliseQuantity(
        line.quantity,
        snapshot.minimumQuantity,
        snapshot.quantityStep,
      );
      if (
        quantity === line.quantity &&
        JSON.stringify(snapshot) === JSON.stringify(line.snapshot)
      ) {
        return line;
      }
      changed = true;
      return { ...line, quantity, snapshot };
    });
    if (changed) commit(next);
  },
};
