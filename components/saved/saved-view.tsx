"use client";

import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { PreviewNotice } from "@/components/ui/section";
import { cartActions } from "@/lib/cart/store";
import { savedStore, useIdList } from "@/lib/id-list-store";
import { overlay } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export function SavedView() {
  const hydrated = useHydrated();
  const ids = useIdList(savedStore);
  const { byId, categoryNames } = useCatalog();
  const products = ids.map((id) => byId.get(id)).filter((p) => p !== undefined);
  const available = products.filter((p) => p.isAvailable);

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted" aria-busy="true" />;
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-dashed border-foreground/30">
          <Heart className="size-7 text-muted-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-heading text-4xl">Nothing saved yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Tap the heart on anything to keep it here — handy for comparing pieces or sharing a shortlist.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Explore the collection
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{products.length}</span>{" "}
          saved {products.length === 1 ? "design" : "designs"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => savedStore.clear()}>
            Clear all
          </Button>
          {available.length > 0 ? (
            <Button
              onClick={() => {
                cartActions.addMany(available.map((p) => ({ product: p, quantity: p.minimumQuantity })));
                overlay.open("cart");
              }}
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              Add {available.length === products.length ? "all" : `${available.length} available`} to cart
            </Button>
          ) : null}
        </div>
      </div>
      <ProductGrid products={products} categoryNames={categoryNames} priorityCount={4} />
      <PreviewNotice className="mt-16 max-w-xl" title="Saved on this device">
        Your saved list lives in this browser. Once customer accounts open, it can sync to your account.
      </PreviewNotice>
    </div>
  );
}
