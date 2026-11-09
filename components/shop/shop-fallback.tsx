import { productGridClass } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";

/** Static shell shown while URL-driven filters resolve on the client. */
export function ShopFallback({ count = 9 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <div className="border-b">
        <div className="mx-auto flex max-w-360 gap-2 px-4 py-4 sm:px-6 lg:px-10">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex max-w-360 gap-2 px-4 py-3 sm:px-6 lg:px-10">
          <div className="h-11 flex-1 animate-pulse rounded-full bg-muted" />
          <div className="h-11 w-11 animate-pulse rounded-full bg-muted sm:w-28 lg:hidden" />
          <div className="h-11 w-28 animate-pulse rounded-full bg-muted sm:w-52" />
        </div>
      </div>
      <div className="mx-auto grid max-w-360 gap-10 px-4 pt-6 pb-24 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-10 lg:pt-8 xl:gap-14">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div>
          <div className="mb-6 h-10 w-32 animate-pulse rounded bg-muted" />
          <div className={cn(productGridClass, "lg:grid-cols-3 2xl:grid-cols-4")}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i}>
                <div className="aspect-4/5 animate-pulse rounded-2xl bg-muted" />
                <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
