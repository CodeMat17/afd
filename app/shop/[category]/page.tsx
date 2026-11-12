import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionEmpty } from "@/components/shop/collection-empty";
import { ShopBrowser, type ShopChip } from "@/components/shop/shop-browser";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/section";
import type { NavDepartment } from "@/lib/catalog-tree";
import { catalog, getCatalogTree } from "@/lib/repository";

/**
 * One URL space for both levels of the taxonomy: /shop/fabrics is a
 * department, /shop/ankara is a category inside it.
 */
async function resolve(slug: string) {
  const tree = await getCatalogTree();
  const department = tree.find((d) => d.slug === slug);
  if (department) return { kind: "department" as const, department, category: null };
  for (const d of tree) {
    const category = d.categories.find((c) => c.slug === slug);
    if (category) return { kind: "category" as const, department: d, category };
  }
  return null;
}

export async function generateStaticParams() {
  const tree = await getCatalogTree();
  const slugs = tree.flatMap((d) => [d.slug, ...d.categories.map((c) => c.slug)]);
  // Cache Components needs at least one param; an empty catalogue 404s on it.
  return (slugs.length ? slugs : ["coming-soon"]).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const match = await resolve(slug);
  if (!match) return { title: "Collection not found" };
  const full = match.category ? await catalog.getCategoryBySlug(match.category.slug) : null;
  const name = match.category?.name ?? match.department.name;
  const imageUrl = match.category?.imageUrl ?? match.department.imageUrl;
  return {
    title: match.category ? `${name} · ${match.department.name}` : name,
    description: full?.description ?? match.department.description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: imageUrl ? { images: [{ url: imageUrl }] } : undefined,
  };
}

function chipsFor(department: NavDepartment, activeSlug: string): ShopChip[] {
  return [
    {
      label: `All ${department.name.toLowerCase()}`,
      href: `/shop/${department.slug}`,
      active: activeSlug === department.slug,
    },
    ...department.categories.map((c) => ({
      label: c.name,
      href: `/shop/${c.slug}`,
      active: activeSlug === c.slug,
    })),
  ];
}

export default async function CollectionPage({ params }: PageProps<"/shop/[category]">) {
  const { category: slug } = await params;
  const match = await resolve(slug);
  if (!match) notFound();
  const { department, category } = match;

  const [products, categories, full] = await Promise.all([
    category
      ? catalog.getProductsByCategory(category.slug)
      : catalog.getProductsByDepartment(department.slug),
    catalog.getCategories(),
    category ? catalog.getCategoryBySlug(category.slug) : null,
  ]);
  const name = category?.name ?? department.name;

  return (
    <>
      <PageHeader
        eyebrow={category?.tagline ?? department.tagline}
        title={name}
        description={full?.description ?? department.description}
        className="border-b-0"
      >
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(category
              ? [{ label: department.name, href: `/shop/${department.slug}` }, { label: category.name }]
              : [{ label: department.name }]),
          ]}
        />
      </PageHeader>
      <ShopBrowser
        products={products}
        categories={categories.map(({ id, name }) => ({ id, name }))}
        chips={chipsFor(department, slug)}
        scoped
        emptyCollection={<CollectionEmpty name={name} />}
      />
    </>
  );
}
