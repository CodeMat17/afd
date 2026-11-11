import type { Product, ProductCategory, ProductDepartment } from "@/lib/types";

/** Serialisable navigation shapes shared by the header, menus, footer and shop. */
export interface NavCategory {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  tagline: string;
  imageUrl?: string;
  productCount: number;
}

export interface NavDepartment {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  imageUrl?: string;
  productCount: number;
  categories: NavCategory[];
}

/**
 * Join departments → categories and count products. When a category or
 * department has no image set, the first product photo stands in, so new
 * sections pick up imagery as soon as products are added.
 */
export function buildCatalogTree(
  departments: ProductDepartment[],
  categories: ProductCategory[],
  products: Product[],
): NavDepartment[] {
  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    byCategory.set(p.categoryId, [...(byCategory.get(p.categoryId) ?? []), p]);
  }
  const firstImage = (items: Product[] | undefined) =>
    items?.find((p) => p.images[0])?.images[0]?.imageUrl;

  return departments.map((department) => {
    const children: NavCategory[] = categories
      .filter((c) => c.departmentId === department.id)
      .map((c) => {
        const items = byCategory.get(c.id);
        return {
          id: c.id,
          departmentId: c.departmentId,
          name: c.name,
          slug: c.slug,
          tagline: c.tagline,
          imageUrl: c.imageUrl ?? firstImage(items),
          productCount: items?.length ?? 0,
        };
      });
    return {
      id: department.id,
      name: department.name,
      slug: department.slug,
      tagline: department.tagline,
      description: department.description,
      imageUrl: department.imageUrl ?? children.find((c) => c.imageUrl)?.imageUrl,
      productCount: children.reduce((n, c) => n + c.productCount, 0),
      categories: children,
    };
  });
}

export function flattenCategories(tree: NavDepartment[]): NavCategory[] {
  return tree.flatMap((d) => d.categories);
}
