import { compareDecimal } from "@/lib/money";
import type { Product, ProductCategory, ShopSort } from "@/lib/types";

export const SORT_OPTIONS: { value: ShopSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const PAGE_SIZE = 12;

export function parseSort(value: string | null): ShopSort {
  return SORT_OPTIONS.some((o) => o.value === value)
    ? (value as ShopSort)
    : "featured";
}

export interface ShopFilters {
  query: string;
  sort: ShopSort;
  availableOnly: boolean;
}

function normalise(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filterProducts(
  products: Product[],
  categories: Pick<ProductCategory, "id" | "name">[],
  filters: ShopFilters,
): Product[] {
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const terms = normalise(filters.query).split(/\s+/).filter(Boolean);

  const matches = products.filter((product) => {
    if (filters.availableOnly && !product.isAvailable) return false;
    if (terms.length === 0) return true;
    const haystack = normalise(
      [
        product.name,
        product.sku,
        categoryNames.get(product.categoryId) ?? "",
        product.colours.join(" "),
      ].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });

  const sorted = [...matches];
  switch (filters.sort) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => compareDecimal(a.price, b.price));
      break;
    case "price-desc":
      sorted.sort((a, b) => compareDecimal(b.price, a.price));
      break;
    case "featured":
      sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      break;
  }
  return sorted;
}
