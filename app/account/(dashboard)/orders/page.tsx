import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CUSTOMER_STATUS, orderDate } from "@/lib/account/orders";
import { fetchAuthQuery } from "@/lib/auth-server";
import { formatCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default async function OrdersPage() {
  const orders = await fetchAuthQuery(api.orders.mine);

  return (
    <div>
      <h2 className="font-heading text-4xl">Order history</h2>

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Package className="size-6 text-muted-foreground" aria-hidden="true" />
          </span>
          <p className="mt-6 font-heading text-3xl">No orders yet</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Orders you place with this account&apos;s email address will appear here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className={buttonVariants()}>
              Shop the collection
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-2xl border">
          {orders.map((order) => {
            const status = CUSTOMER_STATUS[order.status];
            const count = order.items.length;
            return (
              <li key={order.orderNumber}>
                <Link
                  href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
                  className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", status.tone)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {orderDate.format(order.placedAt)} · {count} {count === 1 ? "item" : "items"} ·{" "}
                      {order.items.map((item) => item.name).join(", ")}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatCents(BigInt(order.totalCents))}</p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
