import { Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default function OrdersPage() {
  return (
    <div>
      <h2 className="font-heading text-4xl">Order history</h2>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Package className="size-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <p className="mt-6 font-heading text-3xl">No orders to show</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Order history in your account is coming soon. Your order confirmation page has your
          order details in the meantime.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonVariants()}>
            Shop the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
