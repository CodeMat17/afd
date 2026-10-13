import { productGridClass } from "@/components/product/product-grid";

/** Static shell shown while URL-driven filters resolve on the client. */
export function ShopFallback({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <div className="border-b">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
          <div className="flex gap-2 py-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t py-4 md:flex-row">
            <div className="h-11 flex-1 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-full bg-muted md:w-80" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-360 px-4 pt-8 pb-24 sm:px-6 lg:px-10">
        <div className="mb-8 h-10 w-32 animate-pulse rounded bg-muted" />
        <div className={productGridClass}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="rounded-2xl p-2 ring-1 ring-foreground/10">
              <div className="aspect-4/5 animate-pulse rounded-xl bg-muted" />
              <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
