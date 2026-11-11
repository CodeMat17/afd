import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";

/**
 * Used until an admin saves settings. The shipping fee is a placeholder and
 * is flagged as such; the tax rate is the business's stated 16% (Kenyan VAT).
 */
export const DEFAULT_SETTINGS = {
  taxRateBps: 1600,
  shippingFeeCents: "1500",
  shippingFeeIsPlaceholder: true,
} as const;

/** Tax rate and shipping fee are shown publicly at checkout, so this is open. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "checkout"))
      .unique();
    return {
      taxRateBps: row?.taxRateBps ?? DEFAULT_SETTINGS.taxRateBps,
      shippingFeeCents: row?.shippingFeeCents ?? DEFAULT_SETTINGS.shippingFeeCents,
      shippingFeeIsPlaceholder:
        row?.shippingFeeIsPlaceholder ?? DEFAULT_SETTINGS.shippingFeeIsPlaceholder,
      updatedAt: row?.updatedAt ?? null,
    };
  },
});

export const update = mutation({
  args: {
    serverSecret: v.string(),
    taxRateBps: v.number(),
    shippingFeeCents: v.string(),
  },
  handler: async (ctx, { serverSecret, taxRateBps, shippingFeeCents }) => {
    assertServer(serverSecret);
    if (!Number.isInteger(taxRateBps) || taxRateBps < 0 || taxRateBps > 10000) {
      throw new ConvexError("Tax rate must be between 0% and 100%.");
    }
    if (!/^\d{1,9}$/.test(shippingFeeCents)) {
      throw new ConvexError("Shipping fee must be a whole number of cents.");
    }
    const values = {
      taxRateBps,
      shippingFeeCents,
      shippingFeeIsPlaceholder: false,
      updatedAt: Date.now(),
    };
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "checkout"))
      .unique();
    if (row) await ctx.db.patch(row._id, values);
    else await ctx.db.insert("settings", { key: "checkout", ...values });
  },
});
