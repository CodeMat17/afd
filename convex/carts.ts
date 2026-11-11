import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";

/**
 * Guest carts, keyed by a random ID the Next.js server keeps in an httpOnly
 * cookie. Only the Next server (holding CONVEX_SERVER_SECRET) can read or
 * write them; quantity rules are applied there before saving.
 */

const cartItem = v.object({ productId: v.id("products"), quantity: v.string() });

export const get = query({
  args: { serverSecret: v.string(), cartId: v.string() },
  handler: async (ctx, { serverSecret, cartId }) => {
    assertServer(serverSecret);
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_cartId", (q) => q.eq("cartId", cartId))
      .unique();
    if (!cart) return [];
    // Drop products that have since been deleted from the catalogue.
    const live = await Promise.all(cart.items.map((item) => ctx.db.get(item.productId)));
    return cart.items.filter((_, i) => live[i] !== null);
  },
});

/** Replaces the cart's items; an empty list deletes the cart. */
export const save = mutation({
  args: { serverSecret: v.string(), cartId: v.string(), items: v.array(cartItem) },
  handler: async (ctx, { serverSecret, cartId, items }) => {
    assertServer(serverSecret);
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_cartId", (q) => q.eq("cartId", cartId))
      .unique();
    if (items.length === 0) {
      if (cart) await ctx.db.delete(cart._id);
      return;
    }
    if (cart) await ctx.db.patch(cart._id, { items, updatedAt: Date.now() });
    else await ctx.db.insert("carts", { cartId, items, updatedAt: Date.now() });
  },
});
