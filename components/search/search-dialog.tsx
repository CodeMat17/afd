"use client";

import { ArrowRight, Clock, CornerDownLeft, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Price } from "@/components/product/price";
import { CategoryImage } from "@/components/ui/category-image";
import { useCatalog } from "@/components/providers/catalog-provider";
import { filterProducts, normaliseSearch } from "@/lib/catalog-filters";
import { recentSearchStore, useIdList } from "@/lib/id-list-store";
import { overlay } from "@/lib/ui-store";
import { useOverlayDialog } from "@/lib/use-overlay-dialog";

const MAX_RESULTS = 6;

/** Instant, keyboard-friendly catalogue search. Open with the header button, "/" or ⌘K. */
export function SearchDialog() {
  const { ref, isOpen, close, onClose, onBackdropClick } = useOverlayDialog("search");
  const { products, departments, categories, categoryNames } = useCatalog();
  const router = useRouter();
  const recent = useIdList(recentSearchStore);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const term = query.trim();

  // Global shortcuts: "/" and Ctrl/⌘+K.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        overlay.open("search");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.select();
  }, [isOpen]);

  const results = useMemo(
    () => (term ? filterProducts(products, categories, { query: term, sort: "featured", availableOnly: false, colours: [], price: null }) : []),
    [products, categories, term],
  );
  const matchedCategories = useMemo(() => {
    if (!term) return [];
    const needle = normaliseSearch(term);
    return [...departments, ...categories].filter((c) => normaliseSearch(`${c.name} ${c.tagline}`).includes(needle));
  }, [departments, categories, term]);
  const popular = useMemo(() => products.filter((p) => p.isFeatured && p.isAvailable).slice(0, 4), [products]);

  const remember = (value: string) => {
    const clean = value.trim();
    if (clean.length > 1) recentSearchStore.add(clean.toLowerCase());
  };

  const go = (href: string, rememberTerm?: string) => {
    if (rememberTerm) remember(rememberTerm);
    close();
    router.push(href);
  };

  const submit = () => {
    if (!term) return;
    go(`/shop?q=${encodeURIComponent(term)}`, term);
  };

  /** Arrow keys move between the input and every result link. */
  const onListKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-result]") ?? []);
    if (items.length === 0) return;
    event.preventDefault();
    const index = items.findIndex((el) => el === document.activeElement);
    if (event.key === "ArrowDown") {
      items[Math.min(index + 1, items.length - 1)]?.focus();
    } else if (index <= 0) {
      inputRef.current?.focus();
    } else {
      items[index - 1]?.focus();
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-label="Search the collection"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-background p-0 text-foreground opacity-0 transition-all transition-discrete duration-300 ease-silk open:opacity-100 sm:inset-x-0 sm:top-[8vh] sm:bottom-auto sm:mx-auto sm:h-auto sm:max-h-[80vh] sm:w-[min(92vw,44rem)] sm:-translate-y-3 sm:rounded-xl sm:border sm:shadow-[0_40px_100px_-40px_rgb(0_0_0/0.6)] sm:open:translate-y-0 starting:open:opacity-0 sm:starting:open:-translate-y-3"
    >
      <div className="flex h-full max-h-[inherit] flex-col" onKeyDown={onListKey}>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sm:px-5"
        >
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="global-search" className="sr-only">
            Search products by name, SKU, colour or category
          </label>
          <input
            ref={inputRef}
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, colours, SKUs…"
            autoComplete="off"
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-full px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </form>

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          <p className="sr-only" role="status" aria-live="polite">
            {term ? `${results.length} ${results.length === 1 ? "result" : "results"}` : ""}
          </p>

          {!term ? (
            <div className="space-y-8">
              {recent.length > 0 ? (
                <Group
                  title="Recent searches"
                  action={
                    <button
                      type="button"
                      onClick={() => recentSearchStore.clear()}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  }
                >
                  <ul className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <li key={r}>
                        <Link
                          data-result
                          href={`/shop?q=${encodeURIComponent(r)}`}
                          onClick={() => {
                            remember(r);
                            close();
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors hover:border-foreground"
                        >
                          <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          {r}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              ) : null}

              <Group title="Browse departments">
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {departments.map((c) => (
                    <li key={c.slug}>
                      <Link
                        data-result
                        href={`/shop/${c.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg border p-2 transition-colors hover:border-foreground focus-visible:border-foreground"
                      >
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          <CategoryImage src={c.imageUrl} name={c.name} sizes="40px" showLabel={false} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{c.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{c.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Group>

              {popular.length > 0 ? (
                <Group title="Featured right now">
                  <ResultList products={popular} categoryNames={categoryNames} term="" onNavigate={close} />
                </Group>
              ) : null}
            </div>
          ) : results.length === 0 && matchedCategories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-heading text-3xl">No matches for “{term}”</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a colour like “gold”, a category like “kente” or “gele”, or a SKU.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {matchedCategories.length > 0 ? (
                <Group title="Categories">
                  <ul className="flex flex-wrap gap-2">
                    {matchedCategories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          data-result
                          href={`/shop/${c.slug}`}
                          onClick={() => {
                            remember(term);
                            close();
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors hover:border-foreground"
                        >
                          {c.name}
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              ) : null}
              {results.length > 0 ? (
                <Group title="Products">
                  <ResultList
                    products={results.slice(0, MAX_RESULTS)}
                    categoryNames={categoryNames}
                    term={term}
                    onNavigate={() => {
                      remember(term);
                      close();
                    }}
                  />
                </Group>
              ) : null}
            </div>
          )}
        </div>

        {term && results.length > 0 ? (
          <div className="shrink-0 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link
              data-result
              href={`/shop?q=${encodeURIComponent(term)}`}
              onClick={() => {
                remember(term);
                close();
              }}
              className="flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:bg-muted"
            >
              <span>
                See all {results.length} {results.length === 1 ? "result" : "results"} for “{term}”
              </span>
              <CornerDownLeft className="size-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <p className="hidden shrink-0 items-center gap-4 border-t px-5 py-3 text-xs text-muted-foreground sm:flex">
            <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> to move</span>
            <span><Kbd>Enter</Kbd> to search</span>
            <span><Kbd>Esc</Kbd> to close</span>
          </p>
        )}
      </div>
    </dialog>
  );
}

function Group({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="eyebrow text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ResultList({
  products,
  categoryNames,
  term,
  onNavigate,
}: {
  products: ReturnType<typeof useCatalog>["products"];
  categoryNames: Record<string, string>;
  term: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="-mx-2">
      {products.map((p) => {
        const image = p.images[0];
        return (
          <li key={p.id}>
            <Link
              data-result
              href={`/products/${p.slug}`}
              onClick={onNavigate}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted focus-visible:bg-muted"
            >
              <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {image ? <Image src={image.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-lg leading-tight">
                  <Highlight text={p.name} term={term} />
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {categoryNames[p.categoryId]} · <Highlight text={p.sku} term={term} />
                  {!p.isAvailable ? " · Sold out" : ""}
                </span>
              </span>
              <Price product={p} className="shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Bold the parts of `text` that match any search word. */
function Highlight({ text, term }: { text: string; term: string }) {
  const words = term
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-transparent font-semibold text-primary">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-sans text-[0.6875rem] font-semibold">
      {children}
    </kbd>
  );
}
