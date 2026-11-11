import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { unreferenced } from "./lib/images";
import { assertServer } from "./lib/serverAuth";
import { cloudImage } from "./schema";

/**
 * The home page hero photos. Chosen by the admin in /admin/hero and stored
 * on their own, never derived from products, so adding, editing or selling
 * products leaves the hero exactly as the admin set it.
 */

export const MIN_HERO_IMAGES = 9;
export const MAX_HERO_IMAGES = 15;

/** Public: the storefront renders these. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("hero")
      .withIndex("by_key", (q) => q.eq("key", "home"))
      .unique();
    return { images: row?.images ?? [], updatedAt: row?.updatedAt ?? null };
  },
});

export const save = mutation({
  args: { serverSecret: v.string(), images: v.array(cloudImage) },
  handler: async (ctx, { serverSecret, images }) => {
    assertServer(serverSecret);
    if (images.length < MIN_HERO_IMAGES || images.length > MAX_HERO_IMAGES) {
      throw new ConvexError(`The hero needs ${MIN_HERO_IMAGES}–${MAX_HERO_IMAGES} photos (you have ${images.length}).`);
    }
    if (new Set(images.map((i) => i.publicId)).size !== images.length) {
      throw new ConvexError("The same photo is in the list twice.");
    }

    const row = await ctx.db
      .query("hero")
      .withIndex("by_key", (q) => q.eq("key", "home"))
      .unique();
    const values = { images, updatedAt: Date.now() };
    if (row) await ctx.db.patch(row._id, values);
    else await ctx.db.insert("hero", { key: "home", ...values });

    // Photos taken out of the hero are deleted from Cloudinary unless
    // something else (a product, the gallery…) still uses them.
    const kept = new Set(images.map((i) => i.publicId));
    const removed = (row?.images ?? []).map((i) => i.publicId).filter((id) => !kept.has(id));
    return { orphanedPublicIds: await unreferenced(ctx, removed) };
  },
});
