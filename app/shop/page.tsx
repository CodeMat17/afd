import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopFallback } from "@/components/shop/shop-fallback";
import { PageHeader } from "@/components/ui/section";
import { catalog } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Shop all fabrics",
  description:
    "Browse Ankara, Woven Kente, Isiagu, Ankara Sequin and luxury lace. Search by name, SKU or colour.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    catalog.getProducts(),
    catalog.getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={
          <>
            Shop all <em className="text-primary">fabrics</em>
          </>
        }
        description="Printed, woven and embellished textiles. Filter by fabric family, search by name, SKU or colour, and sort to suit."
        className="border-b-0"
      />
      <Suspense fallback={<ShopFallback />}>
        <ShopBrowser
          products={products}
          categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
        />
      </Suspense>
    </>
  );
}
