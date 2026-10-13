import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopFallback } from "@/components/shop/shop-fallback";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/section";
import { catalog } from "@/lib/repository";

export async function generateStaticParams() {
  const categories = await catalog.getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await catalog.getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} fabrics`,
    description: category.description,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: category.imageUrl ? { images: [{ url: category.imageUrl }] } : undefined,
  };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category: slug } = await params;
  const [category, categories] = await Promise.all([
    catalog.getCategoryBySlug(slug),
    catalog.getCategories(),
  ]);
  if (!category) notFound();
  const products = await catalog.getProductsByCategory(category.slug);

  return (
    <>
      <PageHeader
        eyebrow={category.tagline}
        title={category.name}
        description={category.description}
        className="border-b-0"
      >
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
        />
      </PageHeader>
      <Suspense fallback={<ShopFallback />}>
        <ShopBrowser
          products={products}
          categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
          activeCategory={category.slug}
        />
      </Suspense>
    </>
  );
}
