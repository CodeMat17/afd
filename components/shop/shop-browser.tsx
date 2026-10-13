"use client";

import { ArrowDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  filterProducts,
  parseSort,
  type ShopFilters,
} from "@/lib/catalog-filters";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChipCategory = Pick<ProductCategory, "id" | "name" | "slug">;

export function ShopBrowser({
  products,
  categories,
  activeCategory,
}: {
  products: Product[];
  categories: ChipCategory[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const query = searchParams.get("q") ?? "";
  const sort = parseSort(searchParams.get("sort"));
  const availableOnly = searchParams.get("available") === "1";
  const filters: ShopFilters = { query, sort, availableOnly };

  const [draft, setDraft] = useState(filters.query);
  const debounce = useRef<number | undefined>(undefined);

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const results = useMemo(
    () => filterProducts(products, categories, { query, sort, availableOnly }),
    [products, categories, query, sort, availableOnly],
  );

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const onSearch = (value: string) => {
    setDraft(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => updateParams({ q: value.trim() || null }), 250);
  };

  const clearAll = () => {
    window.clearTimeout(debounce.current);
    setDraft("");
    startTransition(() => {
      if (activeCategory) router.push("/shop", { scroll: false });
      else router.replace("/shop", { scroll: false });
    });
  };

  const hasFilters =
    filters.query !== "" || filters.availableOnly || filters.sort !== "featured" || Boolean(activeCategory);
  const queryString = searchParams.toString();
  const withQuery = (href: string) => (queryString ? `${href}?${queryString}` : href);
  const filterKey = `${pathname}|${filters.query}|${filters.sort}|${filters.availableOnly}`;

  return (
    <div>
      {/* Toolbar */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
          <nav aria-label="Categories" className="-mx-4 sm:-mx-6 lg:mx-0">
            <ul className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:flex-wrap lg:px-0">
              <li>
                <CategoryChip href={withQuery("/shop")} active={!activeCategory}>
                  All fabrics
                </CategoryChip>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <CategoryChip href={withQuery(`/shop/${c.slug}`)} active={activeCategory === c.slug}>
                    {c.name}
                  </CategoryChip>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 border-t py-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <label htmlFor="shop-search" className="sr-only">
                Search by name, SKU, colour or category
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="shop-search"
                type="search"
                value={draft}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search name, SKU, colour…"
                autoComplete="off"
                className="h-11 w-full rounded-full border border-input bg-surface pr-11 pl-11 text-sm placeholder:text-muted-foreground focus-visible:border-primary [&::-webkit-search-cancel-button]:hidden"
              />
              {draft ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft("");
                    updateParams({ q: null });
                  }}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-input bg-surface px-4 text-sm select-none has-checked:border-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => updateParams({ available: e.target.checked ? "1" : null })}
                  className="size-4 accent-(--terracotta) focus-visible:outline-none"
                />
                In stock only
              </label>

              <div className="relative flex-1 md:flex-none">
                <label htmlFor="shop-sort" className="sr-only">
                  Sort products
                </label>
                <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden="true" />
                <select
                  id="shop-sort"
                  value={filters.sort}
                  onChange={(e) => updateParams({ sort: e.target.value === "featured" ? null : e.target.value })}
                  className="h-11 w-full cursor-pointer appearance-none rounded-full border border-input bg-surface pr-10 pl-11 text-sm font-medium focus-visible:border-primary md:w-56"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ArrowDown className="pointer-events-none absolute top-1/2 right-4 size-3.5 -translate-y-1/2" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-360 px-4 pt-8 pb-24 sm:px-6 lg:px-10">
        <div className="mb-8 flex min-h-10 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            <span className="font-semibold text-foreground tabular-nums">{results.length}</span>{" "}
            {results.length === 1 ? "design" : "designs"}
            {filters.query ? <> matching “{filters.query}”</> : null}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <EmptyState
            onClear={clearAll}
            showAllHref={activeCategory ? "/shop" : undefined}
          />
        ) : (
          <PagedResults key={filterKey} products={results} categoryNames={categoryNames} />
        )}
      </div>
    </div>
  );
}

function PagedResults({
  products,
  categoryNames,
}: {
  products: Product[];
  categoryNames: Record<string, string>;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;

  return (
    <>
      <ProductGrid products={shown} categoryNames={categoryNames} priorityCount={4} />
      {remaining > 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {shown.length} of {products.length}
          </p>
          <div className="h-px w-48 overflow-hidden bg-border" aria-hidden="true">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(shown.length / products.length) * 100}%` }} />
          </div>
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load {Math.min(PAGE_SIZE, remaining)} more
          </Button>
        </div>
      ) : null}
    </>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-10 items-center rounded-full border px-4 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors duration-300",
        active
          ? "border-foreground text-background"
          : "border-input bg-surface hover:border-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="category-chip"
          className="absolute inset-0 z-0 rounded-full bg-foreground"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </Link>
  );
}

function EmptyState({ onClear, showAllHref }: { onClear: () => void; showAllHref?: string }) {
  return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-md flex-col items-center py-20 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full border border-dashed border-foreground/30">
          <Search className="size-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-heading text-4xl">Nothing matches — yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Try a different word, colour or SKU, or clear your filters to see the whole collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={onClear}>Clear filters</Button>
          {showAllHref ? (
            <Link
              href={showAllHref}
              className="inline-flex h-11 items-center rounded-full border border-foreground/20 px-6 text-sm font-semibold hover:border-foreground"
            >
              Search all fabrics
            </Link>
          ) : null}
        </div>
      </motion.div>
  );
}
