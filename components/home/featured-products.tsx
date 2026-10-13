import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FeaturedProducts({
  products,
  categoryNames,
}: {
  products: Product[];
  categoryNames: Record<string, string>;
}) {
  return (
    <section aria-labelledby="featured-title" className="border-t bg-surface py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          id="featured-title"
          eyebrow="The edit"
          title={
            <>
              Featured <em className="text-primary">this season</em>
            </>
          }
          description="A curated cross-section of the catalogue — prints, woven cloth, Isiagu and lace."
          action={
            <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "group")}>
              Shop all fabrics
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          }
        />
        <ProductGrid
          products={products}
          categoryNames={categoryNames}
          className="mt-12 lg:mt-16 2xl:grid-cols-4"
        />
      </Container>
    </section>
  );
}
