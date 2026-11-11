import { Check, Clock, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClearCart } from "@/components/checkout/clear-cart";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getOrder, syncPaymentStatus } from "@/lib/checkout/payment";
import { formatRate } from "@/lib/checkout/pricing";
import { formatCents } from "@/lib/money";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false },
};

export default function ConfirmationPage(props: PageProps<"/checkout/confirmation/[orderNumber]">) {
  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">
        <Suspense
          fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-muted" aria-busy="true" />}
        >
          <Confirmation {...props} />
        </Suspense>
      </div>
    </Container>
  );
}

const STATE = {
  paid: {
    icon: Check,
    title: "Thank you — payment received",
    body: "Your order is confirmed. We'll be in touch about pickup or delivery.",
    tone: "border-foreground/20 bg-surface",
  },
  pending: {
    icon: Clock,
    title: "Waiting for payment confirmation",
    body: "Pesapal hasn't confirmed this payment yet. If you completed it, refresh this page in a minute.",
    tone: "border-gold/40 bg-gold/10",
  },
  failed: {
    icon: X,
    title: "Payment didn't go through",
    body: "No payment was taken for this order. You can try checking out again.",
    tone: "border-destructive/30 bg-destructive/5",
  },
  reversed: {
    icon: X,
    title: "Payment reversed",
    body: "This payment was reversed. Contact the showroom if you think this is a mistake.",
    tone: "border-destructive/30 bg-destructive/5",
  },
} as const;

async function Confirmation({ params, searchParams }: PageProps<"/checkout/confirmation/[orderNumber]">) {
  const { orderNumber: raw } = await params;
  const query = await searchParams;
  const orderNumber = decodeURIComponent(raw);
  const trackingParam = query.OrderTrackingId;
  const trackingId = typeof trackingParam === "string" ? trackingParam : undefined;

  let order = await getOrder(orderNumber);
  if (!order) notFound();

  // Customer just returned from Pesapal: confirm directly rather than waiting for the IPN.
  const checkId = trackingId ?? order.pesapalTrackingId;
  if (order.status === "pending" && checkId) {
    try {
      await syncPaymentStatus(orderNumber, checkId);
      order = (await getOrder(orderNumber)) ?? order;
    } catch (error) {
      console.error("[confirmation] status check failed", orderNumber, error);
    }
  }

  const state = STATE[order.status];
  const Icon = state.icon;

  return (
    <>
      {order.status === "paid" ? <ClearCart /> : null}
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-8 font-heading text-5xl leading-[0.95] sm:text-6xl">{state.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Order <span className="font-semibold text-foreground">{order.orderNumber}</span>
        </p>
      </div>

      <div role="status" className={cn("mt-10 rounded-2xl border p-5 text-sm leading-relaxed", state.tone)}>
        {state.body}
        {order.status === "paid" && order.confirmationCode ? (
          <p className="mt-2 text-muted-foreground">
            {order.paymentMethod ? `${order.paymentMethod} · ` : ""}Confirmation {order.confirmationCode}
          </p>
        ) : null}
      </div>

      <section aria-labelledby="order-summary" className="mt-8 rounded-2xl border bg-surface p-6">
        <h2 id="order-summary" className="font-heading text-3xl">
          Summary
        </h2>
        <ul className="mt-4 divide-y text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-semibold">{item.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.quantity} {unitLabel(item.unit as "piece" | "metre" | "yard", item.quantity)} · SKU {item.sku}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatCents(BigInt(item.lineTotalCents))}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t pt-4 text-sm">
          <Row label="Subtotal" value={formatCents(BigInt(order.subtotalCents))} />
          <Row
            label={order.fulfilment === "pickup" ? "Showroom pickup" : "Shipping"}
            value={order.fulfilment === "pickup" ? "Free" : formatCents(BigInt(order.shippingCents))}
          />
          <Row
            label={order.taxDeclared ? `Tax (${formatRate(order.taxRateBps)})` : "Tax"}
            value={order.taxDeclared ? formatCents(BigInt(order.taxCents)) : "Not applied"}
          />
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCents(BigInt(order.totalCents))}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          {order.fulfilment === "pickup"
            ? `Pickup at ${site.address.street}, ${site.address.city}.`
            : `Delivery to ${order.address?.city ?? ""}, ${order.address?.country ?? ""}.`}
        </p>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {order.status === "failed" ? (
          <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
            Try again
          </Link>
        ) : (
          <Link href="/shop" className={buttonVariants({ size: "lg" })}>
            Continue shopping
          </Link>
        )}
        <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Contact the showroom
        </Link>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
