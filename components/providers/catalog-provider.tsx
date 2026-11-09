"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product, ProductCategory } from "@/lib/types";

export type CatalogCategory = Pick<ProductCategory, "id" | "name" | "slug" | "tagline" | "imageUrl">;

interface CatalogContextValue {
  products: Product[];
  categories: CatalogCategory[];
  byId: Map<string, Product>;
  categoryNames: Record<string, string>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

/**
 * Lightweight client copy of the published catalogue for instant search,
 * the cart drawer, saved items and recently viewed. With a large backend
 * catalogue, swap search for a server query; nothing else needs to change.
 */
export function CatalogProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: CatalogCategory[];
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      products,
      categories,
      byId: new Map(products.map((p) => [p.id, p])),
      categoryNames: Object.fromEntries(categories.map((c) => [c.id, c.name])),
    }),
    [products, categories],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return value;
}
