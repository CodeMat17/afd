"use client";

import { useEffect } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Container } from "@/components/ui/section";
import { recentStore, useIdList } from "@/lib/id-list-store";
import { useHydrated } from "@/lib/use-hydrated";

/** Records a product view on this device. Renders nothing. */
export function TrackRecentlyViewed({ productId }: { productId: string }) {
  useEffect(() => {
    recentStore.add(productId);
  }, [productId]);
  return null;
}

/** "Recently viewed" strip; hidden until there is something useful to show. */
export function RecentlyViewed({
  excludeId,
  limit = 4,
  className,
}: {
  excludeId?: string;
  limit?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const ids = useIdList(recentStore);
  const { byId, categoryNames } = useCatalog();

  const products = ids
    .filter((id) => id !== excludeId)
    .map((id) => byId.get(id))
    .filter((p) => p !== undefined)
    .slice(0, limit);

  if (!hydrated || products.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className={className}>
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-3 text-primary">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              Pick up where you left off
            </p>
            <h2 id="recent-title" className="mt-4 font-heading text-4xl leading-none font-medium tracking-[-0.02em] sm:text-5xl">
              Recently viewed
            </h2>
          </div>
          <button
            type="button"
            onClick={() => recentStore.clear()}
            className="min-h-11 shrink-0 text-sm font-semibold text-muted-foreground underline decoration-foreground/30 underline-offset-4 hover:text-foreground"
          >
            Clear history
          </button>
        </div>
        <ProductGrid
          products={products}
          categoryNames={categoryNames}
          className="mt-10 lg:grid-cols-4 2xl:grid-cols-4"
        />
      </Container>
    </section>
  );
}
