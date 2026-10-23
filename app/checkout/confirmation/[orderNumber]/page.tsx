import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Container, PreviewNotice } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false },
};

/**
 * Design-only confirmation layout. It is never reached from checkout until a
 * trusted backend returns a real order, and it shows no fabricated order data.
 */
export default function ConfirmationPage({
  params,
}: PageProps<"/checkout/confirmation/[orderNumber]">) {
  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-dashed border-foreground/30">
          <Check className="size-7 text-muted-foreground" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-8 text-primary">Design preview</p>
        <h1 className="mt-4 font-heading text-5xl leading-[0.95] sm:text-6xl">Order confirmation</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Reference:{" "}
          <Suspense fallback={<span className="inline-block h-4 w-20 animate-pulse rounded bg-muted align-middle" />}>
            {params.then(({ orderNumber }) => (
              <span className="font-semibold text-foreground">{decodeURIComponent(orderNumber)}</span>
            ))}
          </Suspense>
        </p>

        <PreviewNotice title="No order has been placed" className="mt-10 text-left">
          This page shows how a confirmation will look once ordering is connected to a secure
          backend. No order, payment or customer details exist for this reference.
        </PreviewNotice>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {["Order details", "Delivery", "Payment"].map((title) => (
            <div key={title} className="rounded-2xl border border-dashed p-5">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">Shown here after a real order.</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonVariants({ size: "lg" })}>
            Continue shopping
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Contact the showroom
          </Link>
        </div>
      </div>
    </Container>
  );
}
