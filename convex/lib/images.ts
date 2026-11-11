import type { MutationCtx } from "../_generated/server";

/**
 * Of the given Cloudinary public IDs, those no document points at any more
 * (the starter data reuses product photos for categories and the gallery),
 * so the caller can delete them from Cloudinary safely.
 */
export async function unreferenced(ctx: MutationCtx, publicIds: string[]): Promise<string[]> {
  if (publicIds.length === 0) return [];
  const [products, categories, departments, gallery, hero] = await Promise.all([
    ctx.db.query("products").collect(),
    ctx.db.query("categories").collect(),
    ctx.db.query("departments").collect(),
    ctx.db.query("galleryImages").collect(),
    ctx.db.query("hero").collect(),
  ]);
  const inUse = new Set<string>([
    ...products.flatMap((p) => p.images.map((i) => i.publicId)),
    ...categories.flatMap((c) => (c.image ? [c.image.publicId] : [])),
    ...departments.flatMap((d) => (d.image ? [d.image.publicId] : [])),
    ...gallery.map((g) => g.image.publicId),
    ...hero.flatMap((h) => h.images.map((i) => i.publicId)),
  ]);
  return [...new Set(publicIds)].filter((id) => !inUse.has(id));
}
