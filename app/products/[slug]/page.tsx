import { Check, Circle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Price } from "@/components/product/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, SectionHeading } from "@/components/ui/section";
import { catalog } from "@/lib/repository";
import type { Product } from "@/lib/types";
import { unitLabel } from "@/lib/whatsapp";

export async function generateStaticParams() {
  const products = await catalog.getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0];
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: image ? [{ url: image.imageUrl, width: image.width, height: image.height, alt: image.altText }] : undefined,
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
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <Container className="pt-6 pb-20 sm:pt-8 lg:pb-28">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
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
                <div className="flex gap-1.5">
                  <dt>Minimum order</dt>
                  <dd className="font-semibold text-foreground">
                    {product.minimumQuantity} {unitLabel(product.unit, product.minimumQuantity)}
                  </dd>
                </div>
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
            </Reveal>

            <Reveal
              delay={0.15}
              className="mt-10 rounded-2xl border bg-surface p-5 shadow-[0_30px_60px_-40px_rgb(31_26_22/0.35)] sm:p-7"
            >
              <PurchasePanel product={product} />
            </Reveal>

            <Reveal delay={0.2}>
              <FabricDetails product={product} />
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
    </>
  );
}

function Availability({ available }: { available: boolean }) {
  return available ? (
    <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-olive/10 px-3 text-xs font-semibold tracking-wide text-olive dark:bg-secondary/15 dark:text-secondary">
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

function FabricDetails({ product }: { product: Product }) {
  const { details } = product;
  const rows: [string, string][] = [
    ["Selling unit", `Per ${product.unit}`],
    ...(details.pieceLength ? [["Piece length", details.pieceLength] as [string, string]] : []),
    ...(details.material ? [["Material", details.material] as [string, string]] : []),
    ...(details.width ? [["Width", details.width] as [string, string]] : []),
    ...(details.patternNotes ? [["Pattern", details.patternNotes] as [string, string]] : []),
    ...(details.care ? [["Care", details.care] as [string, string]] : []),
  ];
  const missing = !details.material || !details.width || !details.care;

  return (
    <details className="group mt-8 border-y" open>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-xs font-semibold tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
        Fabric details
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
          Material, width and care information hasn&apos;t been supplied for this design yet. Ask on
          WhatsApp to confirm these details before ordering.
        </p>
      ) : null}
    </details>
  );
}
