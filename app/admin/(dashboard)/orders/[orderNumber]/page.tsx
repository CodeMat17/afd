import type { Metadata } from "next";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  Store,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { EmptyState, OrderStatusBadge, PageHeader, Panel, PanelSkeleton } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { customerWhatsappUrl, dateTime, STATUS_META, type Tone } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { formatCents, formatPrice } from "@/lib/money";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };

export default function OrderDetailsPage(props: PageProps<"/admin/orders/[orderNumber]">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PanelSkeleton className="h-28" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PanelSkeleton className="h-96 lg:col-span-2" />
            <PanelSkeleton className="h-96" />
          </div>
        </div>
      }
    >
      <Details {...props} />
    </Suspense>
  );
}

const BANNER: Record<Tone, { icon: LucideIcon; box: string; iconBox: string }> = {
  good: {
    icon: CheckCircle2,
    box: "bg-emerald-600/[0.07] ring-emerald-600/15",
    iconBox: "bg-emerald-600 text-white",
  },
  warn: { icon: Clock3, box: "bg-gold/[0.08] ring-gold/25", iconBox: "bg-gold text-white" },
  bad: { icon: XCircle, box: "bg-destructive/[0.05] ring-destructive/20", iconBox: "bg-destructive text-white" },
  neutral: { icon: ReceiptText, box: "bg-muted ring-foreground/10", iconBox: "bg-foreground text-background" },
};

async function Details({ params }: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  await requireAdmin(`/admin/orders/${orderNumber}`);
  const order = await convexClient().query(api.orders.getByOrderNumber, {
    serverSecret: serverSecret(),
    orderNumber: decodeURIComponent(orderNumber),
  });

  if (!order) {
    return (
      <>
        <PageHeader back={{ href: "/admin/orders", label: "Orders" }} title="Order not found" />
        <EmptyState
          icon={ReceiptText}
          title="We couldn't find that order"
          description="Check the order number, or find it in the orders list."
          action={
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
              Back to orders
            </Link>
          }
        />
      </>
    );
  }

  const meta = STATUS_META[order.status];
  const banner = BANNER[meta.tone];
  const BannerIcon = banner.icon;
  const firstName = order.fullName.split(/\s+/)[0] ?? order.fullName;
  const whatsapp = customerWhatsappUrl(
    order.phone,
    `Hello ${firstName}, this is ${site.name} about your order ${order.orderNumber}.`,
  );
  const next =
    order.status === "paid"
      ? order.fulfilment === "pickup"
        ? "Payment received. Get the pieces ready — the customer will collect them from the showroom."
        : `Payment received. Pack the order and send it to ${order.address?.city ?? "the customer"}.`
      : meta.next;

  const totals: [string, bigint][] = [
    ["Subtotal", BigInt(order.subtotalCents)],
    [order.fulfilment === "pickup" ? "Delivery (pickup)" : "Delivery", BigInt(order.shippingCents)],
  ];
  if (order.taxDeclared || BigInt(order.taxCents) > BigInt(0)) {
    totals.push([`Tax (${order.taxRateBps / 100}%)`, BigInt(order.taxCents)]);
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        eyebrow={`Placed ${dateTime.format(order._creationTime)}`}
        title={
          <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-3xl tracking-tight sm:text-4xl">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} className="px-3 py-1 text-sm" />
          </span>
        }
        actions={
          <Link
            href={`/checkout/confirmation/${order.orderNumber}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink aria-hidden="true" />
            Customer&apos;s receipt
          </Link>
        }
      />

      <div className={cn("mb-6 flex items-start gap-4 rounded-2xl p-4 ring-1 sm:p-5", banner.box)}>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", banner.iconBox)}>
          <BannerIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">What to do next</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{next}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="What they ordered" description={`${order.items.length} item${order.items.length === 1 ? "" : "s"}`}>
            <ul className="divide-y divide-foreground/[0.06]">
              {order.items.map((item) => (
                <li key={item.productId + item.sku} className="flex items-start justify-between gap-4 py-3.5 first:pt-0">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">{item.sku}</span> · {item.quantity} × {formatPrice(item.unitPrice)} per {item.unit}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">{formatCents(BigInt(item.lineTotalCents))}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
              {totals.map(([label, cents]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="tabular-nums">{cents === BigInt(0) ? "Free" : formatCents(cents)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t border-foreground/10 pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-heading text-3xl leading-none font-medium tabular-nums">
                  {formatCents(BigInt(order.totalCents))}
                </dd>
              </div>
            </dl>
          </Panel>

          {order.notes ? (
            <Panel title="Note from the customer">
              <blockquote className="border-l-2 border-primary/60 pl-4 text-[0.9375rem] leading-relaxed text-pretty whitespace-pre-line italic">
                {order.notes}
              </blockquote>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            <p className="text-lg font-semibold">{order.fullName}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <ContactRow icon={Mail} href={`mailto:${order.email}`} label={order.email} />
              <ContactRow icon={Phone} href={`tel:${order.phone.replace(/[^\d+]/g, "")}`} label={order.phone} />
            </ul>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "whatsapp", className: "mt-5 w-full" })}
              >
                <MessageCircle aria-hidden="true" />
                Message on WhatsApp
              </a>
            ) : null}
            {order.taxId ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Tax ID <span className="font-mono font-semibold text-foreground">{order.taxId}</span>
              </p>
            ) : null}
          </Panel>

          <Panel title={order.fulfilment === "pickup" ? "Pickup" : "Delivery"}>
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {order.fulfilment === "pickup" ? (
                  <Store className="size-[1.125rem]" aria-hidden="true" />
                ) : (
                  <Truck className="size-[1.125rem]" aria-hidden="true" />
                )}
              </span>
              {order.fulfilment === "pickup" ? (
                <p className="text-sm leading-relaxed">The customer will collect from the showroom.</p>
              ) : order.address ? (
                <address className="text-sm leading-relaxed not-italic">
                  {order.address.line1}
                  {order.address.line2 ? (
                    <>
                      <br />
                      {order.address.line2}
                    </>
                  ) : null}
                  <br />
                  {[order.address.city, order.address.region, order.address.postalCode].filter(Boolean).join(", ")}
                  <br />
                  {order.address.country}
                </address>
              ) : (
                <p className="text-sm text-muted-foreground">No address was given.</p>
              )}
            </div>
            {order.fulfilment === "delivery" && order.address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [order.address.line1, order.address.city, order.address.country].join(", "),
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Open in Google Maps
              </a>
            ) : null}
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-3 text-sm">
              <PaymentRow label="Status">
                <OrderStatusBadge status={order.status} />
              </PaymentRow>
              {order.paymentMethod ? (
                <PaymentRow label="Method">
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {order.paymentMethod}
                  </span>
                </PaymentRow>
              ) : null}
              {order.paidAt ? <PaymentRow label="Paid on">{dateTime.format(order.paidAt)}</PaymentRow> : null}
              {order.confirmationCode ? (
                <PaymentRow label="Confirmation">
                  <span className="font-mono text-xs">{order.confirmationCode}</span>
                </PaymentRow>
              ) : null}
              {order.pesapalTrackingId ? (
                <PaymentRow label="Pesapal ref.">
                  <span className="font-mono text-xs break-all">{order.pesapalTrackingId}</span>
                </PaymentRow>
              ) : null}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ContactRow({ icon: Icon, href, label }: { icon: LucideIcon; href: string; label: string }) {
  return (
    <li>
      <a href={href} className="group inline-flex max-w-full items-center gap-2.5 hover:text-primary">
        <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
        <span className="truncate underline-offset-4 group-hover:underline">{label}</span>
      </a>
    </li>
  );
}

function PaymentRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
