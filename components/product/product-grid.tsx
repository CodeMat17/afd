import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export const productGridClass =
  "grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14 2xl:grid-cols-5";

export function ProductGrid({
  products,
  categoryNames,
  className,
  priorityCount = 0,
}: {
  products: Product[];
  categoryNames: Record<string, string>;
  className?: string;
  priorityCount?: number;
}) {
  return (
    <ul className={cn(productGridClass, className)}>
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <Reveal delay={(i % 4) * 0.07} className="flex w-full">
            <ProductCard
              product={product}
              categoryName={categoryNames[product.categoryId]}
              priority={i < priorityCount}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
