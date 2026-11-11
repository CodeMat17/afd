import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { unreferenced } from "./lib/images";
import { assertServer } from "./lib/serverAuth";
import { cloudImage, galleryKind } from "./schema";

/**
 * The /gallery photos (kind "gallery") and the home page editorial imagery
 * (kind "editorial"). Managed photo by photo from /admin/gallery: each
 * mutation returns the Cloudinary public IDs nothing uses any more, so the
 * caller can delete those files.
 */

export const MAX_GALLERY_IMAGES = 120;

const text = { caption: v.string(), altText: v.string(), productSlug: v.optional(v.string()) };

function clean(fields: { caption: string; altText: string; productSlug?: string }) {
  const caption = fields.caption.trim();
  const altText = fields.altText.trim();
  if (!caption || !altText) throw new ConvexError("The photo needs a caption and a description.");
  return { caption, altText, productSlug: fields.productSlug || undefined };
}

async function rowsOf(ctx: MutationCtx, kind: "gallery" | "editorial") {
  return await ctx.db
    .query("galleryImages")
    .withIndex("by_kind", (q) => q.eq("kind", kind))
    .collect();
}

async function getRow(ctx: MutationCtx, id: Id<"galleryImages">) {
  const row = await ctx.db.get(id);
  if (!row) throw new ConvexError("That photo no longer exists. Refresh the page.");
  return row;
}

/** Admin: the rows for one kind, in display order. */
export const list = query({
  args: { kind: galleryKind },
  handler: async (ctx, { kind }) => {
    return await ctx.db
      .query("galleryImages")
      .withIndex("by_kind", (q) => q.eq("kind", kind))
      .collect();
  },
});

/** Adds a photo at the end of the list. */
export const add = mutation({
  args: { serverSecret: v.string(), kind: galleryKind, image: cloudImage, ...text },
  handler: async (ctx, { serverSecret, kind, image, ...fields }) => {
    assertServer(serverSecret);
    const rows = await rowsOf(ctx, kind);
    if (rows.length >= MAX_GALLERY_IMAGES) {
      throw new ConvexError(`The gallery holds at most ${MAX_GALLERY_IMAGES} photos.`);
    }
    if (rows.some((row) => row.image.publicId === image.publicId)) {
      throw new ConvexError("That photo is already in the gallery.");
    }
    const sortOrder = rows.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
    return await ctx.db.insert("galleryImages", { kind, image, sortOrder, ...clean(fields) });
  },
});

/** Updates a photo's text and, optionally, swaps the photo itself. */
export const update = mutation({
  args: { serverSecret: v.string(), id: v.id("galleryImages"), image: v.optional(cloudImage), ...text },
  handler: async (ctx, { serverSecret, id, image, ...fields }) => {
    assertServer(serverSecret);
    const row = await getRow(ctx, id);
    const replaced = image && image.publicId !== row.image.publicId ? row.image.publicId : null;
    await ctx.db.patch(id, { ...(image ? { image } : {}), ...clean(fields) });
    return { orphanedPublicIds: replaced ? await unreferenced(ctx, [replaced]) : [] };
  },
});

/** Deletes a photo and its text. */
export const remove = mutation({
  args: { serverSecret: v.string(), id: v.id("galleryImages") },
  handler: async (ctx, { serverSecret, id }) => {
    assertServer(serverSecret);
    const row = await getRow(ctx, id);
    await ctx.db.delete(id);
    return { orphanedPublicIds: await unreferenced(ctx, [row.image.publicId]) };
  },
});

/** Swaps a photo with its neighbour (by = -1 earlier, 1 later), renumbering the list. */
export const move = mutation({
  args: { serverSecret: v.string(), id: v.id("galleryImages"), by: v.union(v.literal(-1), v.literal(1)) },
  handler: async (ctx, { serverSecret, id, by }) => {
    assertServer(serverSecret);
    const row = await getRow(ctx, id);
    const rows = await rowsOf(ctx, row.kind);
    const from = rows.findIndex((r) => r._id === id);
    const to = from + by;
    if (to < 0 || to >= rows.length) return;
    [rows[from], rows[to]] = [rows[to], rows[from]];
    for (const [sortOrder, r] of rows.entries()) {
      if (r.sortOrder !== sortOrder) await ctx.db.patch(r._id, { sortOrder });
    }
  },
});

/**
 * Of photos uploaded but then abandoned (an unsaved new photo, a cancelled
 * replacement), the ones no document uses, so the caller can delete them.
 */
export const releasable = mutation({
  args: { serverSecret: v.string(), publicIds: v.array(v.string()) },
  handler: async (ctx, { serverSecret, publicIds }) => {
    assertServer(serverSecret);
    return await unreferenced(ctx, publicIds);
  },
});
