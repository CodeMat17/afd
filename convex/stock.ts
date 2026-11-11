import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { assertServer } from "./lib/serverAuth";
import { stockReason } from "./schema";

/**
 * Stock levels. A product's `stockQuantity` (a whole-number string, or null
 * when not tracked) is only ever changed here, inside a Convex transaction,
 * and every change writes a `stockMovements` row so the level can be audited.
 */

export const MAX_STOCK = 999_999;
const MAX_HISTORY = 100;

type Reason = Infer<typeof stockReason>;

/** The recorded level as a number, or null when stock isn't tracked. */
export function stockLevel(product: Pick<Doc<"products">, "stockQuantity">): number | null {
  if (product.stockQuantity === null) return null;
  const n = Number(product.stockQuantity);
  return Number.isFinite(n) ? n : 0;
}

function assertPieces(quantity: number, label = "Quantity") {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_STOCK) {
    throw new ConvexError(`${label} must be a whole number between 0 and ${MAX_STOCK.toLocaleString("en-US")}.`);
  }
}

/**
 * Sets a product's level to `balance` and records why. Callers decide the
 * balance; this keeps the product and its history in step.
 */
export async function recordMovement(
  ctx: MutationCtx,
  product: Doc<"products">,
  balance: number,
  reason: Reason,
  extra: { note?: string; orderNumber?: string; shortfall?: number } = {},
) {
  const before = stockLevel(product) ?? 0;
  await ctx.db.patch(product._id, { stockQuantity: String(balance), updatedAt: Date.now() });
  await ctx.db.insert("stockMovements", {
    productId: product._id,
    change: balance - before,
    balance,
    reason,
    ...extra,
  });
  return balance;
}

/** Opening stock for a newly created product. */
export async function recordInitialStock(ctx: MutationCtx, productId: Id<"products">, quantity: number) {
  await ctx.db.insert("stockMovements", { productId, change: quantity, balance: quantity, reason: "initial" });
}

/**
 * Takes a paid order's pieces off the shelf (direction -1) or puts a
 * reversed order's pieces back (+1). Products that were deleted or don't
 * track stock are skipped.
 */
export async function applyOrderToStock(
  ctx: MutationCtx,
  order: Pick<Doc<"orders">, "orderNumber" | "items">,
  direction: -1 | 1,
) {
  for (const item of order.items) {
    const id = ctx.db.normalizeId("products", item.productId);
    const product = id ? await ctx.db.get(id) : null;
    if (!product) continue;
    const level = stockLevel(product);
    if (level === null) continue;
    const quantity = Math.ceil(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    if (direction === -1) {
      const balance = Math.max(level - quantity, 0);
      const shortfall = quantity - (level - balance);
      await recordMovement(ctx, product, balance, "sale", {
        orderNumber: order.orderNumber,
        shortfall: shortfall > 0 ? shortfall : undefined,
      });
    } else {
      await recordMovement(ctx, product, Math.min(level + quantity, MAX_STOCK), "reversal", {
        orderNumber: order.orderNumber,
      });
    }
  }
}

/**
 * A manual change from the admin.
 * - `add` / `remove`: relative, so sales that happen meanwhile aren't lost.
 * - `set`: a physical count. `expected` is the level the admin was looking
 *   at; if it changed since (a sale came in), the count is refused so the
 *   admin can re-check rather than silently overwrite the sale.
 */
export const adjust = mutation({
  args: {
    serverSecret: v.string(),
    productId: v.id("products"),
    kind: v.union(v.literal("add"), v.literal("remove"), v.literal("set")),
    quantity: v.number(),
    reason: stockReason,
    note: v.optional(v.string()),
    expected: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { serverSecret, productId, kind, quantity, reason, note, expected }) => {
    assertServer(serverSecret);
    if (reason === "initial" || reason === "sale" || reason === "reversal") {
      throw new ConvexError("That reason is recorded automatically.");
    }
    assertPieces(quantity);
    const product = await ctx.db.get(productId);
    if (!product) throw new ConvexError("Product not found.");
    const level = stockLevel(product);
    const trimmedNote = note?.trim().slice(0, 300) || undefined;

    let balance: number;
    if (kind === "set") {
      if (expected !== undefined && expected !== product.stockQuantity) {
        throw new ConvexError(
          `The stock level changed to ${product.stockQuantity ?? "not tracked"} while you were counting (probably a sale). Check the count and save again.`,
        );
      }
      balance = quantity;
    } else {
      if (quantity === 0) throw new ConvexError("Enter how many pieces to " + (kind === "add" ? "add." : "remove."));
      const current = level ?? 0;
      if (kind === "add") {
        balance = current + quantity;
        if (balance > MAX_STOCK) throw new ConvexError("That would take the stock level over the maximum.");
      } else {
        if (quantity > current) {
          throw new ConvexError(
            `Only ${current} ${current === 1 ? "piece is" : "pieces are"} recorded in stock, so ${quantity} can't be removed.`,
          );
        }
        balance = current - quantity;
      }
    }
    // A count that matches the record is still logged: it confirms the level on that date.
    if (kind === "set" && reason !== "count" && level !== null && balance === level) {
      throw new ConvexError(`Stock is already ${balance}. Nothing changed.`);
    }

    await recordMovement(ctx, product, balance, reason, { note: trimmedNote });
    return { balance };
  },
});

export const history = query({
  args: { serverSecret: v.string(), productId: v.id("products"), limit: v.optional(v.number()) },
  handler: async (ctx, { serverSecret, productId, limit }) => {
    assertServer(serverSecret);
    return ctx.db
      .query("stockMovements")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .order("desc")
      .take(Math.min(Math.max(limit ?? 30, 1), MAX_HISTORY));
  },
});

/**
 * Checks that each tracked product has enough pieces for an order about to
 * be created. Read live (not from the storefront cache), so it's accurate
 * to the moment the order is placed.
 */
export async function assertInStock(ctx: MutationCtx, items: { productId: string; name: string; quantity: string }[]) {
  for (const item of items) {
    const id = ctx.db.normalizeId("products", item.productId);
    const product = id ? await ctx.db.get(id) : null;
    if (!product) throw new ConvexError(`${item.name} is no longer available. Please review your cart.`);
    const level = stockLevel(product);
    if (level === null) continue;
    const wanted = Number(item.quantity);
    if (wanted > level) {
      throw new ConvexError(
        level > 0
          ? `Only ${level} ${level === 1 ? "piece" : "pieces"} of ${product.name} ${level === 1 ? "is" : "are"} left. Please reduce the quantity in your cart.`
          : `${product.name} has just sold out. Please remove it from your cart.`,
      );
    }
  }
}

/** Removes a deleted product's history. */
export async function deleteMovements(ctx: MutationCtx, productId: Id<"products">) {
  const rows = await ctx.db
    .query("stockMovements")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
}
