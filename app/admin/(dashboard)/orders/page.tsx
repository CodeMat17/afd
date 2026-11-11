import type { Metadata } from "next";
import { ChevronRight, ReceiptText, SearchX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, FilterTabs, OrderStatusBadge, PageHeader, PanelSkeleton, SearchBox } from "@/components/admin/ui";
import {
  dateTime,
  fulfilmentLabel,
  initials,
  relativeTime,
  requestTime,
  STATUS_META,
  STATUS_ORDER,
  type OrderStatus,
} from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Orders" };

const LIMIT = 200;

export default function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Every checkout on your store. Open an order to see what was bought, who to send it to and how it was paid."
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <PanelSkeleton className="h-10 w-full max-w-xl" />
            <PanelSkeleton className="h-[28rem]" />
          </div>
        }
      >
        <Orders {...props} />
      </Suspense>
    </>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function Orders({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin("/admin/orders");
  const [query, orders] = await Promise.all([
    searchParams,
    convexClient().query(api.orders.list, { serverSecret: serverSecret(), limit: LIMIT }),
  ]);
  const now = await requestTime();

  const statusParam = first(query.status);
  const status = STATUS_ORDER.includes(statusParam as OrderStatus) ? (statusParam as OrderStatus) : undefined;
  const q = (first(query.q) ?? "").trim();
  const needle = q.toLowerCase();

  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const o of orders) counts[o.status]++;

  const shown = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      (!needle ||
        [o.orderNumber, o.fullName, o.email, o.phone].some((field) => field.toLowerCase().includes(needle))),
  );

  const tabHref = (s?: OrderStatus) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const str = params.toString();
    return str ? `/admin/orders?${str}` : "/admin/orders";
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No orders yet"
        description="When a customer checks out, their order appears here straight away, along with whether they've paid."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          label="Filter by payment"
          items={[
            { href: tabHref(), label: "All", count: orders.length, active: !status },
            ...STATUS_ORDER.filter((s) => s !== "reversed" || counts.reversed > 0).map((s) => ({
              href: tabHref(s),
              label: STATUS_META[s].label,
              count: counts[s],
              active: status === s,
            })),
          ]}
        />
        <SearchBox
          action="/admin/orders"
          placeholder="Search name, email, phone or order no."
          defaultValue={q}
          keep={{ status }}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching orders"
          description={q ? `Nothing matches “${q}”. Check the spelling, or search by order number.` : "No orders with this status."}
          action={
            <Link href="/admin/orders" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Show all orders
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop: a table */}
          <div className="hidden overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/[0.07] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-foreground/[0.07] text-xs text-muted-foreground">
                <tr>
                  {["Customer", "Order", "Delivery", "Total", "Payment"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 font-semibold">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="w-10 px-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.06]">
                {shown.map((o) => (
                  <tr key={o._id} className="group relative transition-colors hover:bg-muted/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {initials(o.fullName)}
                        </span>
                        <div className="min-w-0">
                          {/* The stretched link makes the whole row clickable. */}
                          <Link
                            href={`/admin/orders/${o.orderNumber}`}
                            className="font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-ring"
                          >
                            {o.fullName}
                          </Link>
                          <span className="block max-w-56 truncate text-xs text-muted-foreground">{o.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold">{o.orderNumber}</span>
                      <span className="block text-xs text-muted-foreground" title={dateTime.format(o._creationTime)}>
                        {relativeTime(o._creationTime, now)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{fulfilmentLabel(o)}</td>
                    <td className="px-5 py-4 font-semibold whitespace-nowrap tabular-nums">
                      {formatCents(BigInt(o.totalCents))}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {o.items.length} item{o.items.length === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={o.status} />
                      {o.paymentMethod ? (
                        <span className="mt-1 block text-xs text-muted-foreground">{o.paymentMethod}</span>
                      ) : null}
                    </td>
                    <td className="px-3 text-muted-foreground">
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: cards */}
          <ul className="space-y-3 md:hidden">
            {shown.map((o) => (
              <li key={o._id}>
                <Link
                  href={`/admin/orders/${o.orderNumber}`}
                  className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/[0.07] transition-colors active:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.fullName}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{o.orderNumber}</p>
                    </div>
                    <p className="shrink-0 font-heading text-2xl leading-none font-medium tabular-nums">
                      {formatCents(BigInt(o.totalCents))}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-foreground/[0.06] pt-3">
                    <OrderStatusBadge status={o.status} />
                    <span className="truncate text-xs text-muted-foreground">
                      {relativeTime(o._creationTime, now)} · {o.fulfilment === "pickup" ? "Pickup" : "Delivery"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Showing {shown.length} of the latest {orders.length} order{orders.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
