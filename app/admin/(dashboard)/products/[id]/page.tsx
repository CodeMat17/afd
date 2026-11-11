import type { Metadata } from "next";
import { ExternalLink, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { StockHistory, type StockMovementRow } from "@/components/admin/stock-history";
import { EmptyState, PageHeader, PanelSkeleton, ToneBadge } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { getAdminCatalog, toFormValues } from "@/lib/admin/catalog";
import { dateTime } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <div className="max-w-4xl">
      <Suspense
        fallback={
          <div className="space-y-6">
            <PanelSkeleton className="h-28" />
            <PanelSkeleton className="h-[40rem]" />
          </div>
        }
      >
        <Edit {...props} />
      </Suspense>
    </div>
  );
}

async function Edit({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  const [query, { products, categoryOptions, categoryName }] = await Promise.all([searchParams, getAdminCatalog()]);
  const product = products.find((p) => p._id === id);
  // Not notFound(): this page is also re-rendered right after its product is
  // deleted, and should say so rather than show a 404.
  if (!product) {
    return (
      <>
        <PageHeader back={{ href: "/admin/products", label: "Products" }} title="Product not found" />
        <EmptyState
          icon={PackageSearch}
          title="This product isn't here any more"
          description="It may have been deleted. You can find all your products in the list."
          action={
            <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
              Back to products
            </Link>
          }
        />
      </>
    );
  }

  const movements = await convexClient().query(api.stock.history, {
    serverSecret: serverSecret(),
    productId: product._id as Id<"products">,
    limit: 50,
  });
  const history: StockMovementRow[] = movements.map((m) => ({
    id: m._id,
    when: dateTime.format(m._creationTime),
    change: m.change,
    balance: m.balance,
    reason: m.reason,
    note: m.note,
    orderNumber: m.orderNumber,
    shortfall: m.shortfall,
  }));

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow={categoryName.get(product.categoryId) ?? "Product"}
        title={product.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-wide">{product.sku}</span>
            <ToneBadge tone={product.isAvailable ? "good" : "neutral"}>
              {product.isAvailable ? "For sale in the shop" : "Hidden from the shop"}
            </ToneBadge>
          </span>
        }
        actions={
          product.isAvailable ? (
            <Link href={`/products/${product.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink aria-hidden="true" />
              View in shop
            </Link>
          ) : null
        }
      />
      <ProductForm
        key={product._id}
        values={toFormValues(product)}
        categoryOptions={categoryOptions}
        notice={query.created ? "Product created. It's live on the storefront." : undefined}
      />
      <div className="mt-12">
        <StockHistory stockQuantity={product.stockQuantity} history={history} />
      </div>
    </>
  );
}
