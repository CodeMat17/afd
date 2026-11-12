import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { PageHeader } from "@/components/ui/section";
import { catalog, getCatalogTree } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Shop African fabrics, ready-to-wear clothing, auto gele, turbans, ipele and beads. Search by name, SKU or colour.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories, departments] = await Promise.all([
    catalog.getProducts(),
    catalog.getCategories(),
    getCatalogTree(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={
          <>
            Shop <em className="text-primary">everything</em>
          </>
        }
        description="Fabrics, ready-to-wear, headwear and accessories — every piece sold individually. Browse by department, search by name, SKU or colour, and sort to suit."
        className="border-b-0"
      />
      <ShopBrowser
        products={products}
        categories={categories.map(({ id, name }) => ({ id, name }))}
        chips={[
          { label: "All", href: "/shop", active: true },
          ...departments.map((d) => ({ label: d.name, href: `/shop/${d.slug}`, active: false })),
        ]}
      />
    </>
  );
}
