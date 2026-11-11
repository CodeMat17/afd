import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ImageOff,
  Package,
  PackageX,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SalesChart, type SalesDay } from "@/components/admin/sales-chart";
import { StockBadge } from "@/components/admin/stock-badge";
import { EmptyState, OrderStatusBadge, PageHeader, Panel, PanelSkeleton, StatCard } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCatalog } from "@/lib/admin/catalog";
import {
  fulfilmentLabel,
  initials,
  longDate,
  nairobiDay,
  nairobiDayStart,
  nairobiHour,
  relativeTime,
  shortDay,
  dayMonth,
  requestTime,
} from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { LOW_STOCK, stockStatus } from "@/lib/admin/stock";
import { getCheckoutSettings } from "@/lib/checkout/settings";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { formatCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const RANGE_DAYS = 30;

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin("/admin");
  // Request time, after the session check: these figures are always live.
  const now = await requestTime();
  const today = nairobiDay(now);
  const firstDay = today - (RANGE_DAYS - 1);
  const previousFirstDay = firstDay - RANGE_DAYS;

  const [orders, recent, catalog, settings] = await Promise.all([
    convexClient().query(api.orders.since, {
      serverSecret: serverSecret(),
      since: nairobiDayStart(previousFirstDay),
    }),
    convexClient().query(api.orders.list, { serverSecret: serverSecret(), limit: 6 }),
    getAdminCatalog(),
    getCheckoutSettings(),
  ]);

  // ── Sales ────────────────────────────────────────────────────────────────
  const zero = BigInt(0);
  const days: SalesDay[] = Array.from({ length: RANGE_DAYS }, (_, i) => {
    const start = nairobiDayStart(firstDay + i);
    return {
      label: shortDay.format(start),
      short: dayMonth.format(start),
      cents: zero,
      orders: 0,
      isToday: firstDay + i === today,
    };
  });
  let current = zero;
  let previous = zero;
  let paidCount = 0;
  let pendingThisWeek = 0;
  const sellers = new Map<string, { name: string; quantity: number; cents: bigint }>();

  for (const o of orders) {
    if (o.status === "pending" && nairobiDay(o._creationTime) > today - 7) pendingThisWeek++;
    if (o.status !== "paid") continue;
    const day = nairobiDay(o.paidAt ?? o._creationTime);
    const total = BigInt(o.totalCents);
    if (day >= firstDay) {
      current += total;
      paidCount++;
      const bucket = days[day - firstDay];
      if (bucket) {
        bucket.cents += total;
        bucket.orders++;
      }
      for (const item of o.items) {
        const entry = sellers.get(item.productId) ?? { name: item.name, quantity: 0, cents: zero };
        entry.quantity += Number(item.quantity);
        entry.cents += BigInt(item.lineTotalCents);
        sellers.set(item.productId, entry);
      }
    } else if (day >= previousFirstDay) {
      previous += total;
    }
  }
  const todayCents = days[days.length - 1].cents;
  const todayOrders = days[days.length - 1].orders;
  const average = paidCount > 0 ? current / BigInt(paidCount) : zero;
  const trend = previous > zero ? Math.round((Number(current - previous) / Number(previous)) * 100) : null;
  const topSellers = [...sellers.values()].sort((a, b) => (b.cents > a.cents ? 1 : b.cents < a.cents ? -1 : 0)).slice(0, 5);
  const topSellerMax = topSellers[0]?.cents ?? zero;

  // ── Catalogue ────────────────────────────────────────────────────────────
  const { products, categoryName } = catalog;
  let pieces = 0;
  let live = 0;
  let tracked = 0;
  const out = [];
  const low = [];
  const noPhoto = [];
  for (const p of products) {
    const status = stockStatus(p.stockQuantity);
    if (status === "out") out.push(p);
    if (status === "low") low.push(p);
    if (p.images.length === 0) noPhoto.push(p);
    if (p.isAvailable) live++;
    if (p.stockQuantity !== null) {
      tracked++;
      pieces += Math.max(Number(p.stockQuantity), 0);
    }
  }
  const stockWatch = [...out, ...low.sort((a, b) => Number(a.stockQuantity) - Number(b.stockQuantity))].slice(0, 5);

  // ── To-do list ───────────────────────────────────────────────────────────
  const tasks: Task[] = [];
  if (settings.shippingFeeIsPlaceholder) {
    tasks.push({
      tone: "bad",
      icon: Truck,
      title: "Set your real delivery fee",
      body: "Checkout is using a placeholder shipping fee. Customers may be charged the wrong amount.",
      href: "/admin/settings",
      cta: "Set fee",
    });
  }
  if (out.length > 0) {
    tasks.push({
      tone: "bad",
      icon: PackageX,
      title: `${out.length} product${out.length === 1 ? " is" : "s are"} sold out`,
      body: "Customers can't buy these. Restock them, or hide them from the shop.",
      href: "/admin/products?stock=out",
      cta: "Review",
    });
  }
  if (low.length > 0) {
    tasks.push({
      tone: "warn",
      icon: AlertTriangle,
      title: `${low.length} product${low.length === 1 ? " is" : "s are"} running low`,
      body: `${LOW_STOCK} pieces or fewer left. A good time to reorder.`,
      href: "/admin/products?stock=low",
      cta: "Review",
    });
  }
  if (pendingThisWeek > 0) {
    tasks.push({
      tone: "warn",
      icon: Clock3,
      title: `${pendingThisWeek} checkout${pendingThisWeek === 1 ? "" : "s"} waiting for payment`,
      body: "Started this week but not paid yet. You could follow up with the customer.",
      href: "/admin/orders?status=pending",
      cta: "See orders",
    });
  }
  const untracked = products.length - tracked;
  if (untracked > 0) {
    tasks.push({
      tone: "warn",
      icon: ClipboardList,
      title: `${untracked} product${untracked === 1 ? " has" : "s have"} no stock count`,
      body: "They never show as sold out, so customers could order pieces you don't have. Open each one and enter the number in stock.",
      href: "/admin/products?stock=untracked",
      cta: "Count",
    });
  }
  if (noPhoto.length > 0) {
    tasks.push({
      tone: "warn",
      icon: ImageOff,
      title: `${noPhoto.length} product${noPhoto.length === 1 ? " has" : "s have"} no photos`,
      body: "Products with photos sell far better. Add at least one image.",
      href: noPhoto.length === 1 ? `/admin/products/${noPhoto[0]._id}` : "/admin/products",
      cta: "Add photos",
    });
  }

  const hour = nairobiHour(now);
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={longDate.format(now)}
        title={greeting}
        description={
          todayOrders > 0
            ? `You've taken ${formatCents(todayCents)} from ${todayOrders} paid order${todayOrders === 1 ? "" : "s"} today. Here's everything else worth knowing.`
            : "Here's how your store is doing, and anything that needs your attention."
        }
        actions={
          <>
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
              <ReceiptText aria-hidden="true" />
              Orders
            </Link>
            <Link href="/admin/products/new" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              Add product
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <TaskList tasks={tasks} />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Sales today"
            value={formatCents(todayCents)}
            hint={todayOrders > 0 ? `${todayOrders} paid order${todayOrders === 1 ? "" : "s"}` : "No paid orders yet today"}
            icon={Banknote}
            tone="good"
          />
          <StatCard
            label="Paid orders"
            value={paidCount}
            hint={`In the last ${RANGE_DAYS} days`}
            icon={ShoppingBag}
            href="/admin/orders?status=paid"
          />
          <StatCard
            label="Average order"
            value={formatCents(average)}
            hint="What a customer spends per order"
            icon={Sparkles}
            tone="warn"
          />
          <StatCard
            label="Products for sale"
            value={live}
            hint={tracked > 0 ? `${pieces.toLocaleString("en-US")} pieces on the shelf` : `${products.length} in the catalogue`}
            icon={Package}
            href="/admin/products"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground">Sales, last {RANGE_DAYS} days</h2>
                <p className="mt-1 font-heading text-5xl leading-none font-medium tabular-nums">{formatCents(current)}</p>
              </div>
              <TrendChip trend={trend} hasCurrent={current > zero} />
            </div>
            {paidCount > 0 ? (
              <SalesChart days={days} />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No sales yet"
                description="Once customers pay for orders, your daily sales will appear here."
                className="py-10"
              />
            )}
          </Panel>

          <Panel title="Best sellers" description={`By sales, last ${RANGE_DAYS} days`}>
            {topSellers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Your best-selling pieces will show here.</p>
            ) : (
              <ol className="space-y-4">
                {topSellers.map((s, i) => (
                  <li key={s.name + i}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-baseline gap-2.5">
                        <span className="font-heading text-lg text-muted-foreground tabular-nums">{i + 1}</span>
                        <span className="truncate font-semibold">{s.name}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatCents(s.cents)}</span>
                    </div>
                    <div className="mt-2 ml-6 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: `${topSellerMax > zero ? (Number(s.cents) / Number(topSellerMax)) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 ml-6 text-xs text-muted-foreground tabular-nums">
                      {s.quantity.toLocaleString("en-US")} sold
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel
            title="Latest orders"
            description="The newest checkouts, paid or not"
            action={{ href: "/admin/orders", label: "All orders" }}
            className="lg:col-span-2"
            bodyClassName="px-2 pb-2 sm:px-3 sm:pb-3"
          >
            {recent.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No orders yet"
                description="When a customer checks out, the order shows up here straight away."
                className="m-3"
              />
            ) : (
              <ul className="divide-y divide-foreground/[0.06]">
                {recent.map((o) => (
                  <li key={o._id}>
                    <Link
                      href={`/admin/orders/${o.orderNumber}`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60 sm:gap-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {initials(o.fullName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{o.fullName}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {o.orderNumber} · {relativeTime(o._creationTime, now)} · {fulfilmentLabel(o)}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums">{formatCents(BigInt(o.totalCents))}</span>
                        <OrderStatusBadge status={o.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Stock watch"
            description="Sold out first, then lowest"
            action={{ href: "/admin/products?stock=low", label: "Stock" }}
            bodyClassName="px-2 pb-2 sm:px-3 sm:pb-3"
          >
            {stockWatch.length === 0 ? (
              <div className="m-3 flex flex-col items-center rounded-2xl bg-emerald-600/[0.06] px-5 py-10 text-center">
                <CheckCircle2 className="size-8 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                <p className="mt-3 font-semibold">Shelves look healthy</p>
                <p className="mt-1 text-sm text-muted-foreground">Nothing is sold out or running low.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {stockWatch.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={`/admin/products/${p._id}#stockQuantity`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                        {p.images[0] ? (
                          <Image src={p.images[0].url} alt="" fill sizes="36px" className="object-cover" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {categoryName.get(p.categoryId) ?? "—"}
                        </span>
                      </span>
                      <StockBadge stockQuantity={p.stockQuantity} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

interface Task {
  tone: "warn" | "bad";
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
}

function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-emerald-600/[0.07] p-4 ring-1 ring-emerald-600/15 sm:p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">You&apos;re all caught up</p>
          <p className="text-sm text-muted-foreground">Nothing needs your attention right now. Enjoy the calm.</p>
        </div>
      </div>
    );
  }
  return (
    <section aria-labelledby="todo-title" className="rounded-2xl bg-card p-2 ring-1 ring-foreground/[0.07] sm:p-3">
      <div className="flex items-center gap-2 px-3 pt-2 pb-3">
        <h2 id="todo-title" className="text-sm font-semibold">
          Needs your attention
        </h2>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
          {tasks.length}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {tasks.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.title}>
              <Link
                href={t.href}
                className={cn(
                  "group flex h-full items-start gap-3.5 rounded-xl p-4 ring-1 transition-[background-color,box-shadow]",
                  t.tone === "bad"
                    ? "bg-destructive/[0.04] ring-destructive/15 hover:bg-destructive/[0.08]"
                    : "bg-gold/[0.06] ring-gold/20 hover:bg-gold/[0.11]",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    t.tone === "bad" ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-gold",
                  )}
                >
                  <Icon className="size-[1.125rem]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{t.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{t.body}</span>
                </span>
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground/80 group-hover:text-foreground">
                  <span className="hidden sm:inline">{t.cta}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TrendChip({ trend, hasCurrent }: { trend: number | null; hasCurrent: boolean }) {
  if (trend === null) {
    return hasCurrent ? (
      <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        First {RANGE_DAYS} days of sales
      </span>
    ) : null;
  }
  const up = trend >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
        up ? "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300" : "bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {up ? "+" : ""}
      {trend}% vs previous {RANGE_DAYS} days
    </span>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4">
        <PanelSkeleton className="h-4 w-40" />
        <PanelSkeleton className="h-12 w-72" />
        <PanelSkeleton className="h-4 w-96 max-w-full" />
      </div>
      <PanelSkeleton className="h-24" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <PanelSkeleton key={i} className="h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelSkeleton className="h-96 lg:col-span-2" />
        <PanelSkeleton className="h-96" />
      </div>
    </div>
  );
}
