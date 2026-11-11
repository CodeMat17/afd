import "server-only";

import type { Doc } from "@/convex/_generated/dataModel";
import type { CategoryOption, ProductFormValues } from "@/components/admin/product-form";
import { nextSku } from "@/convex/lib/sku";
import { api, convexClient } from "@/lib/convex/server";

/** Uncached catalogue read for the admin, so edits always show the latest data. */
export async function getAdminCatalog() {
  const snapshot = await convexClient().query(api.catalog.snapshot, {});
  const categoryOptions: CategoryOption[] = snapshot.departments.map((d) => ({
    department: d.name,
    departmentSlug: d.slug,
    categories: snapshot.categories
      .filter((c) => c.departmentId === d._id)
      .map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        nextSku: nextSku({ id: c._id, name: c.name }, snapshot.products),
      })),
  }));
  const categoryName = new Map<string, string>(snapshot.categories.map((c) => [c._id, c.name]));
  return { ...snapshot, categoryOptions, categoryName };
}

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  price: "",
  description: "",
  colours: "",
  stockQuantity: "",
  material: "",
  pieceLength: "",
  care: "",
  patternNotes: "",
  bust: "",
  waist: "",
  chest: "",
  trouser: "",
  shoulder: "",
  sleeve: "",
  topLength: "",
  hips: "",
  dressLength: "",
  isAvailable: true,
  isFeatured: false,
  images: [],
};

export function toFormValues(p: Doc<"products">): ProductFormValues {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    categoryId: p.categoryId,
    price: p.price,
    description: p.description,
    colours: p.colours.join(", "),
    stockQuantity: p.stockQuantity ?? "",
    material: p.details.material ?? "",
    pieceLength: p.details.pieceLength ?? "",
    care: p.details.care ?? "",
    patternNotes: p.details.patternNotes ?? "",
    bust: p.sizes?.bust ?? "",
    waist: p.sizes?.waist ?? "",
    chest: p.sizes?.chest ?? "",
    trouser: p.sizes?.trouser ?? "",
    shoulder: p.sizes?.shoulder ?? "",
    sleeve: p.sizes?.sleeve ?? "",
    topLength: p.sizes?.topLength ?? "",
    hips: p.sizes?.hips ?? "",
    dressLength: p.sizes?.dressLength ?? "",
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    images: p.images,
  };
}
