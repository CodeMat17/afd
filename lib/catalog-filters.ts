import { compareDecimal, toCents } from "@/lib/money";
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

/**
 * Colour families group the free-text colour names in the catalogue so
 * shoppers can filter by "Blue" and find Cobalt, Navy and Azure. A product
 * belongs to every family any of its colours matches.
 */
export const COLOUR_FAMILIES = [
  { id: "red", label: "Red", swatch: "#b3261e", keywords: ["red", "crimson", "maroon", "berry", "rust"] },
  { id: "pink", label: "Pink", swatch: "#e07a9a", keywords: ["pink", "blush", "magenta", "coral"] },
  { id: "orange", label: "Orange", swatch: "#e07b2a", keywords: ["orange", "tangerine", "amber", "peach"] },
  { id: "yellow", label: "Yellow", swatch: "#e8c12f", keywords: ["yellow", "mustard", "saffron", "chartreuse"] },
  { id: "green", label: "Green", swatch: "#3f7d4a", keywords: ["green", "emerald", "lime", "olive", "mint"] },
  { id: "blue", label: "Blue", swatch: "#2f5fb3", keywords: ["blue", "cobalt", "navy", "azure", "indigo", "turquoise", "teal"] },
  { id: "purple", label: "Purple", swatch: "#7b4fa6", keywords: ["violet", "lilac", "plum", "purple"] },
  { id: "neutral", label: "Black & neutral", swatch: "linear-gradient(135deg,#1f1a16 50%,#f2ece2 50%)", keywords: ["black", "white", "ivory", "cream", "grey", "gray", "charcoal", "brown", "cocoa"] },
  { id: "metallic", label: "Gold & metallic", swatch: "linear-gradient(135deg,#c9a24b,#f3e2a9 50%,#a8a8a8)", keywords: ["gold", "silver", "copper", "champagne", "metallic"] },
] as const;

export type ColourFamilyId = (typeof COLOUR_FAMILIES)[number]["id"];

export const PRICE_RANGES = [
  { id: "under-10", label: "Under $10", min: null, max: "10" },
  { id: "10-50", label: "$10 – $50", min: "10", max: "50" },
  { id: "50-200", label: "$50 – $200", min: "50", max: "200" },
  { id: "200-plus", label: "$200 and above", min: "200", max: null },
] as const;

export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

export function parseColours(value: string | null): ColourFamilyId[] {
  if (!value) return [];
  const valid = new Set<string>(COLOUR_FAMILIES.map((f) => f.id));
  return [...new Set(value.split(","))].filter((v): v is ColourFamilyId => valid.has(v));
}

export function parsePrice(value: string | null): PriceRangeId | null {
  return PRICE_RANGES.find((r) => r.id === value)?.id ?? null;
}

export interface ShopFilters {
  query: string;
  sort: ShopSort;
  availableOnly: boolean;
  colours: ColourFamilyId[];
  price: PriceRangeId | null;
}

export function normaliseSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function colourFamiliesOf(product: Pick<Product, "colours">): Set<ColourFamilyId> {
  const families = new Set<ColourFamilyId>();
  for (const colour of product.colours) {
    const words = normaliseSearch(colour).split(/\s+/);
    for (const family of COLOUR_FAMILIES) {
      if (family.keywords.some((k) => words.includes(k))) families.add(family.id);
    }
  }
  return families;
}

function inPriceRange(price: string, id: PriceRangeId): boolean {
  const range = PRICE_RANGES.find((r) => r.id === id);
  if (!range) return true;
  const cents = toCents(price);
  if (range.min !== null && cents < toCents(range.min)) return false;
  if (range.max !== null && cents >= toCents(range.max)) return false;
  return true;
}

/** Products matching everything except the given facet — used for facet counts. */
export function facetCounts(
  products: Product[],
  categories: Pick<ProductCategory, "id" | "name">[],
  filters: ShopFilters,
) {
  const withoutColour = filterProducts(products, categories, { ...filters, colours: [] });
  const withoutPrice = filterProducts(products, categories, { ...filters, price: null });
  const colours = Object.fromEntries(COLOUR_FAMILIES.map((f) => [f.id, 0])) as Record<ColourFamilyId, number>;
  for (const p of withoutColour) for (const id of colourFamiliesOf(p)) colours[id] += 1;
  const prices = Object.fromEntries(
    PRICE_RANGES.map((r) => [r.id, withoutPrice.filter((p) => inPriceRange(p.price, r.id)).length]),
  ) as Record<PriceRangeId, number>;
  return { colours, prices };
}

export function filterProducts(
  products: Product[],
  categories: Pick<ProductCategory, "id" | "name">[],
  filters: ShopFilters,
): Product[] {
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const terms = normaliseSearch(filters.query).split(/\s+/).filter(Boolean);

  const matches = products.filter((product) => {
    if (filters.availableOnly && !product.isAvailable) return false;
    if (filters.price && !inPriceRange(product.price, filters.price)) return false;
    if (filters.colours.length > 0) {
      const families = colourFamiliesOf(product);
      if (!filters.colours.some((c) => families.has(c))) return false;
    }
    if (terms.length === 0) return true;
    const haystack = normaliseSearch(
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
