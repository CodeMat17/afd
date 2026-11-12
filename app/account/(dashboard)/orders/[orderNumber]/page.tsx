import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { CUSTOMER_STATUS, orderDate } from "@/lib/account/orders";
import { fetchAuthQuery } from "@/lib/auth-server";
import { formatCents } from "@/lib/money";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({ params }: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await fetchAuthQuery(api.orders.mineByNumber, {
    orderNumber: decodeURIComponent(orderNumber),
  });
  if (!order) notFound();

  const status = CUSTOMER_STATUS[order.status];
  const money = (cents: string) => formatCents(BigInt(cents));
  const a = order.address;

  return (
    <div>
      <Link href="/account/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
        <ArrowLeft className="size-4" aria-hidden="true" /> All orders
      </Link>
      <h2 className="mt-4 font-heading text-4xl">Order {order.orderNumber}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Placed {orderDate.format(order.placedAt)}</p>

      <div role="status" className={cn("mt-6 rounded-2xl border p-5 text-sm leading-relaxed", status.tone)}>
        <p className="font-semibold">{status.label}</p>
        <p className="mt-1 text-muted-foreground">{status.note}</p>
        {order.status === "paid" && order.confirmationCode ? (
          <p className="mt-1 text-muted-foreground">
            {order.paymentMethod ? `${order.paymentMethod} · ` : ""}Confirmation {order.confirmationCode}
          </p>
        ) : null}
      </div>

      <section aria-labelledby="items" className="mt-8 rounded-2xl border p-6">
        <h3 id="items" className="text-xs font-semibold tracking-[0.12em] uppercase">
          Items
        </h3>
        <ul className="mt-2 divide-y text-sm">
          {order.items.map((item) => (
            <li key={item.sku} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-semibold">{item.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.quantity} {unitLabel(item.unit as "piece" | "metre" | "yard", item.quantity)} · SKU {item.sku}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{money(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t pt-4 text-sm">
          <Row label="Subtotal" value={money(order.subtotalCents)} />
          <Row
            label={order.fulfilment === "pickup" ? "Showroom pickup" : "Shipping"}
            value={order.fulfilment === "pickup" ? "Free" : money(order.shippingCents)}
          />
          {order.taxDeclared ? <Row label="Tax" value={money(order.taxCents)} /> : null}
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="fulfilment" className="mt-4 rounded-2xl border p-6 text-sm leading-relaxed">
        <h3 id="fulfilment" className="text-xs font-semibold tracking-[0.12em] uppercase">
          {order.fulfilment === "pickup" ? "Pickup" : "Delivery address"}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {order.fulfilment === "pickup"
            ? `${site.address.street}, ${site.address.city}, ${site.address.country}`
            : a
              ? [a.line1, a.line2, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(", ")
              : "No address recorded."}
        </p>
      </section>
    </div>
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
