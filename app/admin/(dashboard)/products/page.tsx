import type { Metadata } from "next";
import { AlertTriangle, Boxes, Package, PackageX, Pencil, Plus, SearchX, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { StockBadge } from "@/components/admin/stock-badge";
import { EmptyState, FilterTabs, PageHeader, PanelSkeleton, SearchBox, StatCard, ToneBadge } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCatalog } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/admin/session";
import { LOW_STOCK, stockStatus } from "@/lib/admin/stock";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Products" };

const FILTERS = [
  { key: "all", label: "All products" },
  { key: "low", label: "Running low" },
  { key: "out", label: "Sold out" },
  { key: "untracked", label: "Not counted yet" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

export default function AdminProductsPage(props: PageProps<"/admin/products">) {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Everything in your shop. Tap a product to change its details, photos or stock."
        actions={
          <Link href="/admin/products/new" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Add product
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <PanelSkeleton key={i} className="h-32" />
              ))}
            </div>
            <PanelSkeleton className="h-[28rem]" />
          </div>
        }
      >
        <Products {...props} />
      </Suspense>
    </>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function Products({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin("/admin/products");
  const [query, { products, categoryName }] = await Promise.all([searchParams, getAdminCatalog()]);
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Your shop is empty"
        description="Add your first product: give it a name, a price and a few photos, and it goes live straight away."
        action={
          <Link href="/admin/products/new" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Add your first product
          </Link>
        }
      />
    );
  }

  const stockParam = first(query.stock);
  const filter: Filter = FILTERS.some((f) => f.key === stockParam) ? (stockParam as Filter) : "all";
  const q = (first(query.q) ?? "").trim();
  const needle = q.toLowerCase();

  const counts: Record<Filter, number> = { all: products.length, low: 0, out: 0, untracked: 0 };
  let piecesInStock = 0;
  let live = 0;
  for (const p of products) {
    const status = stockStatus(p.stockQuantity);
    if (status === "low") counts.low++;
    if (status === "out") counts.out++;
    if (status === "untracked") counts.untracked++;
    if (p.isAvailable) live++;
    if (p.stockQuantity !== null) piecesInStock += Math.max(Number(p.stockQuantity), 0);
  }

  // Sold out first, then lowest stock, so what needs restocking is on top.
  const shown = products
    .filter((p) => filter === "all" || stockStatus(p.stockQuantity) === filter)
    .filter(
      (p) =>
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle) ||
        (categoryName.get(p.categoryId) ?? "").toLowerCase().includes(needle),
    )
    .sort((a, b) => {
      if (filter === "low" || filter === "out") return Number(a.stockQuantity) - Number(b.stockQuantity);
      return a.name.localeCompare(b.name);
    });

  const tabHref = (key: Filter) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("stock", key);
    if (q) params.set("q", q);
    const str = params.toString();
    return str ? `/admin/products?${str}` : "/admin/products";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Products" value={products.length} hint={`${live} for sale in the shop`} icon={Package} />
        <StatCard
          label="Pieces on the shelf"
          value={piecesInStock.toLocaleString("en-US")}
          hint="Across all tracked products"
          icon={Boxes}
          tone="good"
        />
        <StatCard
          label="Running low"
          value={counts.low}
          hint={`${LOW_STOCK} pieces or fewer left`}
          icon={AlertTriangle}
          tone={counts.low > 0 ? "warn" : "neutral"}
          href={tabHref("low")}
        />
        <StatCard
          label="Sold out"
          value={counts.out}
          hint="Customers can't buy these"
          icon={PackageX}
          tone={counts.out > 0 ? "bad" : "neutral"}
          href={tabHref("out")}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          label="Filter by stock"
          items={FILTERS.filter((f) => f.key !== "untracked" || counts.untracked > 0 || filter === "untracked").map((f) => ({
            href: tabHref(f.key),
            label: f.label,
            count: counts[f.key],
            active: filter === f.key,
          }))}
        />
        <SearchBox
          action="/admin/products"
          placeholder="Search name, SKU or category"
          defaultValue={q}
          keep={{ stock: filter === "all" ? undefined : filter }}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            q
              ? "No matching products"
              : filter === "untracked"
                ? "Every product has a stock count"
                : filter === "out"
                  ? "Nothing is sold out"
                  : "Nothing is running low"
          }
          description={
            q
              ? `Nothing matches “${q}”.`
              : filter === "untracked"
                ? "The shop knows when each product sells out."
                : "Good news — your shelves are well stocked."
          }
          action={
            <Link href="/admin/products" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Show all products
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop: a table */}
          <div className="hidden overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/[0.07] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-foreground/[0.07] text-xs text-muted-foreground">
                <tr>
                  {["Product", "Category", "Price", "Stock", "In the shop"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 font-semibold">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.06]">
                {shown.map((p) => (
                  <tr key={p._id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3.5">
                        <Thumb url={p.images[0]?.url} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${p._id}`}
                            className="font-semibold underline-offset-4 hover:underline"
                          >
                            {p.name}
                          </Link>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono">{p.sku}</span>
                            {p.isFeatured ? (
                              <span className="inline-flex items-center gap-0.5 text-gold">
                                <Star className="size-3 fill-current" aria-hidden="true" />
                                Featured
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{categoryName.get(p.categoryId) ?? "—"}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/products/${p._id}#stockQuantity`} title="Change stock">
                        <StockBadge stockQuantity={p.stockQuantity} />
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <ToneBadge tone={p.isAvailable ? "good" : "neutral"}>{p.isAvailable ? "For sale" : "Hidden"}</ToneBadge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}`}
                          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                          aria-label={`Edit ${p.name}`}
                          title="Edit product and stock"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Link>
                        <DeleteProductButton id={p._id} name={p.name} compact />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: cards */}
          <ul className="space-y-3 md:hidden">
            {shown.map((p) => (
              <li key={p._id}>
                <Link
                  href={`/admin/products/${p._id}`}
                  className="flex gap-4 rounded-2xl bg-card p-3 ring-1 ring-foreground/[0.07] transition-colors active:bg-muted/60"
                >
                  <Thumb url={p.images[0]?.url} large />
                  <div className="flex min-w-0 flex-1 flex-col py-0.5">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {categoryName.get(p.categoryId) ?? "—"} · <span className="font-mono">{p.sku}</span>
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="font-heading text-xl leading-none font-medium tabular-nums">
                        {formatPrice(p.price)}
                      </span>
                      <StockBadge stockQuantity={p.stockQuantity} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Thumb({ url, large }: { url?: string; large?: boolean }) {
  return (
    <div className={large ? "relative h-24 w-18 shrink-0 overflow-hidden rounded-xl bg-muted" : "relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted"}>
      {url ? (
        <Image src={url} alt="" fill sizes={large ? "72px" : "44px"} className="object-cover" />
      ) : (
        <Package className="absolute inset-0 m-auto size-4 text-muted-foreground/60" aria-hidden="true" />
      )}
    </div>
  );
}
