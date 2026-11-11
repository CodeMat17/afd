import "server-only";

import { cache } from "react";
import { buildCatalogTree } from "@/lib/catalog-tree";
import { convexRepository } from "@/lib/repository/convex";
import type { CatalogRepository } from "@/lib/repository/types";

/**
 * The active catalogue source: Convex for data, Cloudinary for photos.
 * Seed an empty deployment with `yarn seed:catalog`.
 */
export const catalog: CatalogRepository = convexRepository;

/** Departments → categories with product counts, deduplicated per request. */
export const getCatalogTree = cache(async () => {
  const [departments, categories, products] = await Promise.all([
    catalog.getDepartments(),
    catalog.getCategories(),
    catalog.getProducts(),
  ]);
  return buildCatalogTree(departments, categories, products);
});

export { CATALOG_TAG, HERO_TAG } from "@/lib/repository/convex";
export type { CatalogRepository } from "@/lib/repository/types";
