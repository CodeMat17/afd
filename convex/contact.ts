import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";

/**
 * The showroom's phone, WhatsApp and email. One row (key "site"); until the
 * admin saves it, `get` returns null and the storefront uses the defaults in
 * lib/contact.ts.
 */

/** Public: the storefront renders these. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("contact")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    return row ? { phone: row.phone, whatsapp: row.whatsapp, email: row.email, updatedAt: row.updatedAt } : null;
  },
});

const digits = (value: string) => value.replace(/\D/g, "").length;

export const update = mutation({
  args: { serverSecret: v.string(), phone: v.string(), whatsapp: v.string(), email: v.string() },
  handler: async (ctx, { serverSecret, phone, whatsapp, email }) => {
    assertServer(serverSecret);
    phone = phone.trim();
    whatsapp = whatsapp.trim();
    email = email.trim();
    for (const [label, value] of [["Phone", phone], ["WhatsApp", whatsapp]] as const) {
      if (!/^\+?[\d\s()-]+$/.test(value) || digits(value) < 7 || digits(value) > 15) {
        throw new ConvexError(`${label} number must be 7–15 digits, e.g. +254 710 660 524.`);
      }
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Enter a valid email address.");
    }

    const values = { phone, whatsapp, email, updatedAt: Date.now() };
    const row = await ctx.db
      .query("contact")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (row) await ctx.db.patch(row._id, values);
    else await ctx.db.insert("contact", { key: "site", ...values });
  },
});
