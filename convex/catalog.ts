import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { unreferenced } from "./lib/images";
import { assertServer } from "./lib/serverAuth";
import { nextSku } from "./lib/sku";
import { adminProductFields, cloudImage, galleryKind, productFields } from "./schema";
import { deleteMovements, MAX_STOCK, recordInitialStock, recordMovement } from "./stock";

/**
 * The catalogue: departments → categories → products, plus gallery imagery.
 * Photos live on Cloudinary; documents here only hold their references.
 *
 * Reads are public (it's the storefront). Writes need CONVEX_SERVER_SECRET
 * and are only made by the Next.js server after an admin check.
 */

const MAX_IMAGES = 12;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DECIMAL = /^\d{1,7}(\.\d{1,2})?$/;

/** Everything the storefront renders, in one round trip. The catalogue is small. */
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const [departments, categories, products, gallery] = await Promise.all([
      ctx.db.query("departments").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("galleryImages").collect(),
    ]);
    const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
    return {
      departments: departments.sort(bySort),
      categories: categories.sort(bySort),
      products,
      gallery: gallery.sort(bySort),
    };
  },
});

export const saveProduct = mutation({
  args: {
    serverSecret: v.string(),
    /** Omit to create. */
    id: v.optional(v.id("products")),
    categoryId: v.id("categories"),
    ...adminProductFields,
    /**
     * Pieces in stock. Required: every product is tracked, and 0 means sold
     * out. For a new product it is the opening stock; for an existing one a
     * different number is recorded as a stock count in the history.
     */
    stock: v.number(),
    /**
     * The level the admin saw when the form loaded (null = not tracked). If a
     * sale changed it meanwhile, a new number is refused rather than silently
     * overwriting the sale.
     */
    expectedStock: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { serverSecret, id, stock, expectedStock, ...input }) => {
    assertServer(serverSecret);
    const category = await ctx.db.get(input.categoryId);
    if (!category) throw new ConvexError("That category no longer exists.");

    // The SKU is never taken from the caller: a new product gets the next
    // code for its category, an existing one keeps the code it was given
    // (orders and WhatsApp enquiries refer to it).
    const existing = id ? await ctx.db.get(id) : null;
    if (id && !existing) throw new ConvexError("Product not found.");
    const sku = existing
      ? existing.sku
      : nextSku({ id: category._id, name: category.name }, await ctx.db.query("products").collect());
    if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
      throw new ConvexError("Stock must be a whole number (0 or more).");
    }
    // Only a changed number touches the level, so editing other details never
    // collides with a sale that came in while the form was open.
    const stockChanged = !existing || existing.stockQuantity === null || Number(existing.stockQuantity) !== stock;
    if (existing && stockChanged && expectedStock !== undefined && expectedStock !== existing.stockQuantity) {
      throw new ConvexError(
        `Stock changed to ${existing.stockQuantity ?? "not tracked"} while you were editing (probably a sale). Reload the page, check the number and save again.`,
      );
    }
    // An existing product keeps its level in this patch; recordMovement below
    // sets the new one and logs it.
    const stockQuantity = existing ? existing.stockQuantity : String(stock);
    const fields = { ...input, sku, stockQuantity };
    validateProduct(fields);

    const slugOwner = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", fields.slug))
      .first();
    if (slugOwner && slugOwner._id !== id) throw new ConvexError(`The URL slug "${fields.slug}" is already used.`);
    const skuOwner = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", fields.sku))
      .first();
    if (skuOwner && skuOwner._id !== id) throw new ConvexError(`SKU ${fields.sku} is already used.`);

    if (!id || !existing) {
      const newId = await ctx.db.insert("products", {
        ...fields,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: Date.now(),
      });
      await recordInitialStock(ctx, newId, Number(stockQuantity));
      return { id: newId, orphanedPublicIds: [] as string[] };
    }

    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
    if (stockChanged) {
      await recordMovement(ctx, existing, stock, "count", { note: "Updated in the product form" });
    }

    const kept = new Set(fields.images.map((i) => i.publicId));
    const removed = existing.images.map((i) => i.publicId).filter((p) => !kept.has(p));
    return { id, orphanedPublicIds: await unreferenced(ctx, removed) };
  },
});

export const deleteProduct = mutation({
  args: { serverSecret: v.string(), id: v.id("products") },
  handler: async (ctx, { serverSecret, id }) => {
    assertServer(serverSecret);
    const product = await ctx.db.get(id);
    if (!product) return { orphanedPublicIds: [] as string[] };
    await ctx.db.delete(id);
    // Orders keep their own copy of name, SKU and price, so only the stock
    // history goes with the product.
    await deleteMovements(ctx, id);
    return { orphanedPublicIds: await unreferenced(ctx, product.images.map((i) => i.publicId)) };
  },
});

/**
 * One-off import of the starter catalogue (scripts/seed-catalog.mjs).
 * Insert-only: rows whose slug / SKU / image already exist are skipped, so
 * re-running it never overwrites edits made in the admin.
 */
export const seed = mutation({
  args: {
    serverSecret: v.string(),
    departments: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        tagline: v.string(),
        description: v.string(),
        image: v.optional(cloudImage),
        sortOrder: v.number(),
      }),
    ),
    categories: v.array(
      v.object({
        departmentSlug: v.string(),
        slug: v.string(),
        name: v.string(),
        tagline: v.string(),
        description: v.optional(v.string()),
        image: v.optional(cloudImage),
        sortOrder: v.number(),
      }),
    ),
    products: v.array(v.object({ categorySlug: v.string(), createdAt: v.string(), ...productFields })),
    gallery: v.array(
      v.object({
        kind: galleryKind,
        image: cloudImage,
        altText: v.string(),
        caption: v.string(),
        productSlug: v.optional(v.string()),
        sortOrder: v.number(),
      }),
    ),
  },
  handler: async (ctx, { serverSecret, ...data }) => {
    assertServer(serverSecret);
    const inserted = { departments: 0, categories: 0, products: 0, gallery: 0 };

    const departmentIds = new Map<string, Id<"departments">>();
    for (const d of data.departments) {
      const found = await ctx.db
        .query("departments")
        .withIndex("by_slug", (q) => q.eq("slug", d.slug))
        .first();
      departmentIds.set(d.slug, found?._id ?? (await ctx.db.insert("departments", d)));
      if (!found) inserted.departments++;
    }

    const categoryIds = new Map<string, Id<"categories">>();
    for (const { departmentSlug, ...c } of data.categories) {
      const departmentId = departmentIds.get(departmentSlug);
      if (!departmentId) throw new ConvexError(`Unknown department "${departmentSlug}".`);
      const found = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", c.slug))
        .first();
      categoryIds.set(c.slug, found?._id ?? (await ctx.db.insert("categories", { ...c, departmentId })));
      if (!found) inserted.categories++;
    }

    for (const { categorySlug, ...p } of data.products) {
      const categoryId = categoryIds.get(categorySlug);
      if (!categoryId) throw new ConvexError(`Unknown category "${categorySlug}".`);
      const found = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", p.sku))
        .first();
      if (found) continue;
      validateProduct(p);
      await ctx.db.insert("products", { ...p, categoryId, updatedAt: Date.now() });
      inserted.products++;
    }

    for (const g of data.gallery) {
      const found = await ctx.db
        .query("galleryImages")
        .withIndex("by_kind_publicId", (q) => q.eq("kind", g.kind).eq("image.publicId", g.image.publicId))
        .first();
      if (found) continue;
      await ctx.db.insert("galleryImages", g);
      inserted.gallery++;
    }

    return inserted;
  },
});

function validateProduct(p: Pick<Doc<"products">, "slug" | "sku" | "name" | "price" | "images">) {
  if (!SLUG.test(p.slug)) throw new ConvexError("Slug may only contain lowercase letters, numbers and dashes.");
  if (!p.sku.trim()) throw new ConvexError("SKU is required.");
  if (!p.name.trim()) throw new ConvexError("Name is required.");
  if (!DECIMAL.test(p.price)) throw new ConvexError("Price must be an amount such as 6.50.");
  if (p.images.length > MAX_IMAGES) throw new ConvexError(`A product can have at most ${MAX_IMAGES} photos.`);
}
