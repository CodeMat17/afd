import { Check, Circle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Price } from "@/components/product/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { RecentlyViewed, TrackRecentlyViewed } from "@/components/product/recently-viewed";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, SectionHeading } from "@/components/ui/section";
import { SIZE_LABELS, type SizeField } from "@/lib/admin/product-fields";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { unitLabel } from "@/lib/whatsapp";

export async function generateStaticParams() {
  const products = await catalog.getProducts();
  // Cache Components needs at least one param; an empty catalogue 404s on it.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "coming-soon" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  // Share image: ./opengraph-image.tsx
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_KE",
      title: product.name,
      description: product.description,
    },
  };
}

/*
 * Product structured data (JSON-LD) is intentionally omitted: prices and
 * availability are test data and must not be published to search engines.
 */

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const [category, related, categories] = await Promise.all([
    catalog.getCategoryById(product.categoryId),
    catalog.getRelatedProducts(product, 4),
    catalog.getCategories(),
  ]);
  const department = category ? await catalog.getDepartmentById(category.departmentId) : null;
  const isFabric = department?.slug === "fabrics";
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <Container className="pt-6 pb-20 sm:pt-8 lg:pb-28">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(department ? [{ label: department.name, href: `/shop/${department.slug}` }] : []),
            ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="lg:py-4">
            <Reveal>
              {category ? (
                <p className="eyebrow flex items-center gap-3 text-primary">
                  <span className="h-px w-10 bg-current opacity-60" aria-hidden="true" />
                  {category.name}
                </p>
              ) : null}
              <h1 className="mt-5 font-heading text-[2.75rem] leading-[0.92] font-medium tracking-[-0.02em] text-balance sm:text-6xl xl:text-[4.25rem]">
                {product.name}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Price product={product} size="lg" />
                <Availability available={product.isAvailable} />
              </div>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <dt>SKU</dt>
                  <dd className="font-semibold text-foreground">{product.sku}</dd>
                </div>
                {product.minimumQuantity !== "1" ? (
                  <div className="flex gap-1.5">
                    <dt>Minimum order</dt>
                    <dd className="font-semibold text-foreground">
                      {product.minimumQuantity} {unitLabel(product.unit, product.minimumQuantity)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-8 max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                {product.description}
              </p>

              {product.colours.length > 0 ? (
                <div className="mt-6">
                  <p className="text-xs font-semibold tracking-[0.12em] uppercase">Colours</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.colours.map((colour) => (
                      <li key={colour} className="rounded-full border px-3 py-1.5 text-xs">
                        {colour}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <SizeChart sizes={product.sizes} />
            </Reveal>

            <Reveal
              delay={0.15}
              className="mt-10 rounded-2xl border bg-surface p-5 shadow-[0_30px_60px_-40px_rgb(31_26_22/0.35)] sm:p-7"
            >
              <PurchasePanel product={product} />
            </Reveal>

            <Reveal delay={0.2}>
              <ProductDetailsPanel product={product} isFabric={isFabric} />
            </Reveal>
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="border-t bg-surface py-20 lg:py-28">
          <Container>
            <SectionHeading
              id="related-title"
              eyebrow="You may also like"
              title={
                <>
                  More from <em className="text-primary">{category?.name ?? "the collection"}</em>
                </>
              }
            />
            <ProductGrid
              products={related}
              categoryNames={categoryNames}
              className="mt-12 2xl:grid-cols-4"
            />
          </Container>
        </section>
      ) : null}

      <TrackRecentlyViewed productId={product.id} />
      <RecentlyViewed excludeId={product.id} className="border-t py-20 lg:py-28" />
    </>
  );
}

function Availability({ available }: { available: boolean }) {
  return available ? (
    <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-olive/10 px-3 text-xs font-semibold tracking-wide text-olive dark:bg-secondary/15">
      <Check className="size-3.5" aria-hidden="true" />
      Available
    </p>
  ) : (
    <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold tracking-wide text-muted-foreground">
      <Circle className="size-3.5" aria-hidden="true" />
      Sold out
    </p>
  );
}

/** Garment measurements — only the ones entered for this piece are shown. */
function SizeChart({ sizes }: { sizes?: Product["sizes"] }) {
  const rows = (Object.entries(SIZE_LABELS) as [SizeField, string][]).flatMap(([key, label]) => {
    const value = sizes?.[key]?.trim();
    return value ? [{ label, value }] : [];
  });
  if (rows.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold tracking-[0.12em] uppercase">Size</p>
      <dl className="mt-3 flex flex-wrap gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex min-w-24 flex-col rounded-xl border px-4 py-2.5">
            <dt className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="mt-0.5 font-heading text-xl leading-tight tabular-nums lining-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProductDetailsPanel({ product, isFabric }: { product: Product; isFabric: boolean }) {
  const { details } = product;
  const rows: [string, string][] = [
    ["Sold as", product.unit === "piece" ? "Single piece — a quantity of 2 means two pieces" : `Per ${product.unit}`],
    ...(details.pieceLength ? [["Piece length", details.pieceLength] as [string, string]] : []),
    ...(details.material ? [["Material", details.material] as [string, string]] : []),
    ...(details.width ? [["Width", details.width] as [string, string]] : []),
    ...(details.patternNotes ? [["Notes", details.patternNotes] as [string, string]] : []),
    ...(details.care ? [["Care", details.care] as [string, string]] : []),
  ];
  const missing = isFabric
    ? !details.pieceLength || !details.material || !details.care
    : !details.material || !details.care;

  return (
    <details className="group mt-8 border-y" open>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-xs font-semibold tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
        Product details
        <span className="text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <dl className="grid gap-x-6 gap-y-3 pb-6 text-sm sm:grid-cols-[9rem_1fr]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {missing ? (
        <p className="pb-6 text-xs leading-relaxed text-muted-foreground">
          {isFabric
            ? "Piece length, material and care information hasn't been supplied for this design yet."
            : "Material and care information hasn't been supplied for this piece yet."}{" "}
          Ask on WhatsApp to confirm before ordering.
        </p>
      ) : null}
    </details>
  );
}
