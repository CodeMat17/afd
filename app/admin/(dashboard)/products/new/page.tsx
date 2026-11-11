import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { EMPTY_PRODUCT, getAdminCatalog } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow="Catalogue"
        title="Add a product"
        description="Start with photos, then choose a category: the form only asks for the details that category needs. It goes live in the shop as soon as you save."
      />
      <Suspense fallback={<PanelSkeleton className="h-[40rem]" />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  await requireAdmin("/admin/products/new");
  const { categoryOptions } = await getAdminCatalog();
  return <ProductForm values={EMPTY_PRODUCT} categoryOptions={categoryOptions} />;
}
