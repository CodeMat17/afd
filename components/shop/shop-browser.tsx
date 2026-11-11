"use client";

import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COLOUR_FAMILIES,
  PAGE_SIZE,
  PRICE_RANGES,
  SORT_OPTIONS,
  facetCounts,
  filterProducts,
  parseColours,
  parsePrice,
  parseSort,
  type ColourFamilyId,
  type PriceRangeId,
  type ShopFilters,
} from "@/lib/catalog-filters";
import type { Product, ProductCategory } from "@/lib/types";
import { useDialog } from "@/lib/use-dialog";
import { cn } from "@/lib/utils";

type NameCategory = Pick<ProductCategory, "id" | "name">;

export interface ShopChip {
  label: string;
  href: string;
  active: boolean;
}
type Patch = Record<string, string | null>;

export function ShopBrowser({
  products,
  categories,
  chips,
  scoped = false,
  emptyCollection,
}: {
  products: Product[];
  /** Every category, used for names on cards and in search. */
  categories: NameCategory[];
  /** Navigation chips: departments on /shop, sibling categories inside a department. */
  chips: ShopChip[];
  /** True on a department or category page (clearing filters returns to /shop). */
  scoped?: boolean;
  /** Shown instead of the grid when this collection has no products yet. */
  emptyCollection?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const {
    ref: sheetRef,
    open: openSheet,
    close: closeSheet,
    onClose: onSheetClose,
  } = useDialog();

  const filters: ShopFilters = {
    query: searchParams.get("q") ?? "",
    sort: parseSort(searchParams.get("sort")),
    availableOnly: searchParams.get("available") === "1",
    colours: parseColours(searchParams.get("colour")),
    price: parsePrice(searchParams.get("price")),
  };

  const [draft, setDraft] = useState(filters.query);
  const debounce = useRef<number | undefined>(undefined);

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  // The catalogue is small; filtering on each render is cheap and always in sync with the URL.
  const results = filterProducts(products, categories, filters);
  const counts = facetCounts(products, categories, filters);

  const updateParams = (patch: Patch) => {
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

  const toggleColour = (id: ColourFamilyId) => {
    const set = new Set(filters.colours);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    updateParams({ colour: [...set].join(",") || null });
  };

  const clearAll = () => {
    window.clearTimeout(debounce.current);
    setDraft("");
    startTransition(() => {
      if (scoped) router.push("/shop", { scroll: false });
      else router.replace("/shop", { scroll: false });
    });
  };

  const facetCount =
    filters.colours.length + (filters.price ? 1 : 0) + (filters.availableOnly ? 1 : 0);
  const hasFilters =
    filters.query !== "" || facetCount > 0 || filters.sort !== "featured" || scoped;
  const queryString = searchParams.toString();
  const withQuery = (href: string) => (queryString ? `${href}?${queryString}` : href);
  const filterKey = `${pathname}|${queryString}`;

  const panel = (variant: "sidebar" | "sheet") => (
    <FilterPanel
      variant={variant}
      filters={filters}
      counts={counts}
      onAvailable={(on) => updateParams({ available: on ? "1" : null })}
      onColour={toggleColour}
      onPrice={(id) => updateParams({ price: id })}
    />
  );

  const chipNav = (
      <div className="border-b bg-background">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
          <nav aria-label="Categories" className="-mx-4 sm:-mx-6 lg:mx-0">
            <ul className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:flex-wrap lg:px-0">
              {chips.map((chip) => (
                <li key={chip.href}>
                  <CategoryChip href={withQuery(chip.href)} active={chip.active}>
                    {chip.label}
                  </CategoryChip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
  );

  if (products.length === 0 && emptyCollection) {
    return (
      <div>
        {chipNav}
        {emptyCollection}
      </div>
    );
  }

  return (
    <div>
      {chipNav}

      {/* Sticky toolbar */}
      <div className="sticky top-(--header-height) z-30 border-b bg-background/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-360 items-center gap-2 px-4 py-3 sm:px-6 lg:px-10">
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
              enterKeyHint="search"
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

          <button
            type="button"
            onClick={openSheet}
            aria-haspopup="dialog"
            className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-input bg-surface px-4 text-sm font-semibold transition-colors hover:border-foreground lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span className="max-sm:sr-only">Filters</span>
            {facetCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-bold text-primary-foreground tabular-nums">
                {facetCount}
                <span className="sr-only"> active</span>
              </span>
            ) : null}
          </button>

          <div className="shrink-0">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <Select
              items={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={filters.sort}
              onValueChange={(next) => {
                if (typeof next === "string") updateParams({ sort: next === "featured" ? null : next });
              }}
            >
              <SelectTrigger
                id="shop-sort"
                className="h-11 w-28 cursor-pointer rounded-full bg-surface pr-3.5 pl-4 text-sm font-medium data-[size=default]:h-11 hover:border-foreground focus-visible:border-primary sm:w-52"
              >
                <SelectValue className="truncate" />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false} className="min-w-52">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="py-2 pl-2.5">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-360 gap-10 px-4 pt-6 pb-24 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-10 lg:pt-8 xl:gap-14">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+5.5rem)] max-h-[calc(100dvh-var(--header-height)-7rem)] overflow-y-auto pr-2 pb-6">
            {panel("sidebar")}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex min-h-10 flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted-foreground" role="status" aria-live="polite">
              <span className="font-semibold text-foreground tabular-nums">{results.length}</span>{" "}
              {results.length === 1 ? "design" : "designs"}
              {filters.query ? <> matching “{filters.query}”</> : null}
            </p>
            {filters.colours.map((id) => (
              <ActiveChip key={id} onRemove={() => toggleColour(id)}>
                {COLOUR_FAMILIES.find((f) => f.id === id)?.label}
              </ActiveChip>
            ))}
            {filters.price ? (
              <ActiveChip onRemove={() => updateParams({ price: null })}>
                {PRICE_RANGES.find((r) => r.id === filters.price)?.label}
              </ActiveChip>
            ) : null}
            {filters.availableOnly ? (
              <ActiveChip onRemove={() => updateParams({ available: null })}>In stock</ActiveChip>
            ) : null}
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {results.length === 0 ? (
            <EmptyState onClear={clearAll} showAllHref={scoped ? "/shop" : undefined} />
          ) : (
            <PagedResults key={filterKey} products={results} categoryNames={categoryNames} />
          )}
        </div>
      </div>

      {/* Mobile / tablet filter sheet */}
      <dialog
        ref={sheetRef}
        onClose={onSheetClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
        aria-labelledby="filter-sheet-title"
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[88dvh] w-full max-w-none translate-y-full rounded-t-2xl bg-background p-0 text-foreground opacity-0 transition-all transition-discrete duration-500 ease-silk open:translate-y-0 open:opacity-100 starting:open:translate-y-full starting:open:opacity-0 lg:hidden"
      >
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
            <span aria-hidden="true" className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/20" />
            <h2 id="filter-sheet-title" className="font-heading text-2xl">
              Filters
            </h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label="Close filters"
              className="-mr-2 flex size-11 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{panel("sheet")}</div>
          <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              variant="ghost"
              onClick={() => updateParams({ colour: null, price: null, available: null })}
              disabled={facetCount === 0}
            >
              Reset
            </Button>
            <Button onClick={closeSheet}>
              Show {results.length} {results.length === 1 ? "design" : "designs"}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function FilterPanel({
  filters,
  counts,
  onAvailable,
  onColour,
  onPrice,
  variant,
}: {
  variant: "sidebar" | "sheet";
  filters: ShopFilters;
  counts: ReturnType<typeof facetCounts>;
  onAvailable: (on: boolean) => void;
  onColour: (id: ColourFamilyId) => void;
  onPrice: (id: PriceRangeId | null) => void;
}) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Availability</legend>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium">
          In stock only
          <input
            type="checkbox"
            role="switch"
            checked={filters.availableOnly}
            onChange={(e) => onAvailable(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-10 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-background after:shadow after:transition-transform peer-checked:after:translate-x-4"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Colour</legend>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-1">
          {COLOUR_FAMILIES.map((family) => {
            const count = counts.colours[family.id];
            const checked = filters.colours.includes(family.id);
            return (
              <li key={family.id}>
                <label
                  className={cn(
                    "group flex min-h-11 cursor-pointer items-center gap-3 rounded-lg text-sm",
                    count === 0 && !checked && "opacity-45",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onColour(family.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="relative flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-foreground/15 ring-offset-2 ring-offset-background transition-shadow peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                    style={{ background: family.swatch }}
                  >
                    {checked ? (
                      <Check className="size-3.5 text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.6)]" strokeWidth={3} />
                    ) : null}
                  </span>
                  <span className={cn("flex-1", checked && "font-semibold")}>{family.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Price</legend>
        <ul className="space-y-1">
          {[{ id: null, label: "Any price" } as const, ...PRICE_RANGES].map((range) => {
            const checked = filters.price === range.id;
            const count = range.id ? counts.prices[range.id] : null;
            return (
              <li key={range.id ?? "any"}>
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 text-sm",
                    count === 0 && !checked && "opacity-45",
                  )}
                >
                  <input
                    type="radio"
                    name={`price-range-${variant}`}
                    checked={checked}
                    onChange={() => onPrice(range.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border border-input transition-colors peer-checked:border-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40 peer-checked:*:scale-100"
                  >
                    <span className="size-2.5 scale-0 rounded-full bg-primary transition-transform" />
                  </span>
                  <span className={cn("flex-1", checked && "font-semibold")}>{range.label}</span>
                  {count !== null ? (
                    <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

function ActiveChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-85"
    >
      {children}
      <X className="size-3" aria-hidden="true" />
      <span className="sr-only">(remove filter)</span>
    </button>
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
      <ProductGrid
        products={shown}
        categoryNames={categoryNames}
        priorityCount={4}
        className="lg:grid-cols-3 2xl:grid-cols-4"
      />
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
            Search the whole store
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
