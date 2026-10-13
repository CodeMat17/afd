import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PreviewNotice } from "@/components/ui/section";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default function OrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  return (
    <div>
      <Link href="/account/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
        <ArrowLeft className="size-4" aria-hidden="true" /> All orders
      </Link>
      <h2 className="mt-4 font-heading text-4xl">
        Order{" "}
        <Suspense fallback={<span className="inline-block h-8 w-24 animate-pulse rounded bg-muted align-middle" />}>
          {params.then(({ orderNumber }) => decodeURIComponent(orderNumber))}
        </Suspense>
      </h2>
      <PreviewNotice title="Order details aren't available yet" className="mt-6">
        Orders will load here from a secure backend once accounts are connected. No order data exists
        in this preview.
      </PreviewNotice>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {["Items", "Delivery address", "Status", "Payment"].map((title) => (
          <div key={title} className="rounded-md border border-dashed p-5">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">Not available in preview.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
