import type { Metadata } from "next";
import { Download, SearchX, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EmptyState, FilterTabs, PageHeader, Pagination, PanelSkeleton, SearchBox, ToneBadge } from "@/components/admin/ui";
import { customerQuery, filterCustomers, parseCustomerFilter, type CustomerFilter } from "@/lib/admin/customers";
import { dateTime, initials, relativeTime, requestTime } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Customers" };

const PAGE_SIZE = 50;

export default function AdminCustomersPage(props: PageProps<"/admin/customers">) {
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Everyone who has created an account on your store, newest first, with what each has ordered."
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <PanelSkeleton className="h-10 w-full max-w-xl" />
            <PanelSkeleton className="h-[28rem]" />
          </div>
        }
      >
        <Customers {...props} />
      </Suspense>
    </>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function ordersHref(email: string) {
  return `/admin/orders?q=${encodeURIComponent(email)}`;
}

function ConfirmedBadge({ confirmed }: { confirmed: boolean }) {
  return confirmed ? (
    <ToneBadge tone="good">Email confirmed</ToneBadge>
  ) : (
    <ToneBadge tone="warn">Not confirmed</ToneBadge>
  );
}

async function Customers({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin("/admin/customers");
  const [query, customers] = await Promise.all([
    searchParams,
    convexClient().query(api.customers.list, { serverSecret: serverSecret() }),
  ]);
  const now = await requestTime();

  const filter = parseCustomerFilter(first(query.filter));
  const q = (first(query.q) ?? "").trim();

  const confirmedCount = customers.filter((c) => c.emailVerified).length;
  const shown = filterCustomers(customers, filter, q);

  const buildHref = (f: CustomerFilter, page = 1) => `/admin/customers${customerQuery(f, q, page)}`;

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const pageParam = first(query.page);
  const requested = Number(pageParam);
  const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pageCount) : 1;
  if (pageParam !== undefined && (pageParam !== String(page) || page === 1)) redirect(buildHref(filter, page));
  const pageItems = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="When someone creates an account on your store, their name and email appear here."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          label="Filter by email status"
          items={[
            { href: buildHref("all"), label: "All", count: customers.length, active: filter === "all" },
            { href: buildHref("confirmed"), label: "Confirmed", count: confirmedCount, active: filter === "confirmed" },
            {
              href: buildHref("unconfirmed"),
              label: "Not confirmed",
              count: customers.length - confirmedCount,
              active: filter === "unconfirmed",
            },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox
            action="/admin/customers"
            placeholder="Search name or email"
            defaultValue={q}
            keep={{ filter: filter === "all" ? undefined : filter }}
          />
          {shown.length > 0 ? (
            // A plain link, not <Link>: the browser should download the file, not navigate.
            <a
              href={`/admin/customers/export${customerQuery(filter, q)}`}
              download
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-foreground/12 bg-card px-4 text-sm font-semibold whitespace-nowrap transition-colors hover:border-foreground/40"
            >
              <Download className="size-4" aria-hidden="true" />
              Download emails (CSV)
              <span className="sr-only">
                {" "}
                for {shown.length} customer{shown.length === 1 ? "" : "s"}
              </span>
            </a>
          ) : null}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching customers"
          description={q ? `Nothing matches “${q}”. Check the spelling, or search part of the email.` : "No customers in this group."}
          action={
            <Link href="/admin/customers" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Show all customers
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
                  {["Customer", "Signed up", "Email", "Orders", "Spent"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.06]">
                {pageItems.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">{c.name}</p>
                          <a
                            href={`mailto:${c.email}`}
                            className="block max-w-64 truncate text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {c.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground" title={dateTime.format(c.createdAt)}>
                      {relativeTime(c.createdAt, now)}
                    </td>
                    <td className="px-5 py-4">
                      <ConfirmedBadge confirmed={c.emailVerified} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {c.orderCount > 0 ? (
                        <Link
                          href={ordersHref(c.email)}
                          className="font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">None yet</span>
                      )}
                      {c.lastOrderAt ? (
                        <span className="block text-xs text-muted-foreground">Last {relativeTime(c.lastOrderAt, now)}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 font-semibold whitespace-nowrap tabular-nums">
                      {c.paidCount > 0 ? formatCents(BigInt(c.paidCents)) : <span className="font-normal text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: cards */}
          <ul className="space-y-3 md:hidden">
            {pageItems.map((c) => (
              <li key={c.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/[0.07]">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="block truncate text-sm text-muted-foreground">
                      {c.email}
                    </a>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/[0.06] pt-3">
                  <ConfirmedBadge confirmed={c.emailVerified} />
                  <span className="text-xs text-muted-foreground">
                    Joined {relativeTime(c.createdAt, now)} ·{" "}
                    {c.orderCount > 0 ? (
                      <Link href={ordersHref(c.email)} className="font-semibold text-primary">
                        {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                      </Link>
                    ) : (
                      "no orders"
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            total={shown.length}
            href={(n) => buildHref(filter, n)}
            noun={shown.length === 1 ? "customer" : "customers"}
          />
        </>
      )}
    </div>
  );
}
