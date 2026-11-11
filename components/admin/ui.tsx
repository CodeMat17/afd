import { ArrowLeft, ArrowRight, ArrowUpRight, Search, type LucideIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import { STATUS_META, type OrderStatus, type Tone } from "@/lib/admin/orders";
import { cn } from "@/lib/utils";

/**
 * Building blocks shared by every admin page, so the dashboard reads as one
 * product: the same headers, cards, numbers and empty states everywhere.
 */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 lg:mb-10">
      {back ? (
        <Link
          href={back.href}
          className="group mb-5 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-2 text-primary">{eyebrow}</p> : null}
          <h1 className="font-heading text-4xl leading-[1.05] font-medium text-balance sm:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

/** A surface card. Every panel on the dashboard sits in one of these. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "flex min-w-0 flex-col rounded-2xl bg-card shadow-[0_1px_2px_rgb(52_45_40/0.04),0_12px_32px_-20px_rgb(52_45_40/0.18)] ring-1 ring-foreground/[0.07]",
        className,
      )}
    >
      {title ? (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 className="font-heading text-2xl leading-tight font-medium">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className="group inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {action.label}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={cn("flex-1 p-5 sm:p-6", title && "pt-4 sm:pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

const TONE_ICON: Record<Tone, string> = {
  good: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  warn: "bg-gold/15 text-gold",
  bad: "bg-destructive/10 text-destructive",
  neutral: "bg-primary/10 text-primary",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", TONE_ICON[tone])}>
          <Icon className="size-[1.125rem]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-heading text-[2.5rem] leading-none font-medium tabular-nums">{value}</p>
      {hint ? <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </>
  );
  const className =
    "group relative block rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgb(52_45_40/0.04),0_12px_32px_-20px_rgb(52_45_40/0.18)] ring-1 ring-foreground/[0.07] transition-[box-shadow,transform] duration-300 ease-silk";
  if (!href) return <div className={className}>{body}</div>;
  return (
    <Link href={href} className={cn(className, "hover:-translate-y-0.5 hover:ring-foreground/15")}>
      {body}
      <ArrowUpRight
        className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-foreground/15 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-heading text-2xl font-medium">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

const TONE_BADGE: Record<Tone, { box: string; dot: string }> = {
  good: {
    box: "border-emerald-600/25 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  warn: { box: "border-gold/35 bg-gold/10 text-gold", dot: "bg-gold" },
  bad: { box: "border-destructive/25 bg-destructive/10 text-destructive", dot: "bg-destructive" },
  neutral: { box: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
};

export function ToneBadge({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold whitespace-nowrap",
        TONE_BADGE[tone].box,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", TONE_BADGE[tone].dot)} />
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  );
}

/** Pill-style tabs that filter a list through the URL, so the view survives a refresh. */
export function FilterTabs({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; count?: number; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
            item.active
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/12 bg-card hover:border-foreground/40",
          )}
        >
          {item.label}
          {item.count !== undefined ? (
            <span
              className={cn(
                "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums",
                item.active ? "bg-background/15" : "bg-muted text-muted-foreground",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function PanelSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted/70", className)} aria-busy="true" />;
}

/** A search box that filters through the URL (`?q=`), keeping the other filters. */
export function SearchBox({
  action,
  placeholder,
  defaultValue,
  keep,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
  keep?: Record<string, string | undefined>;
}) {
  return (
    <Form action={action} role="search" className="relative w-full sm:max-w-xs">
      {Object.entries(keep ?? {}).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-full border border-foreground/12 bg-card pr-4 pl-10 text-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 hover:border-foreground/30 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none"
      />
    </Form>
  );
}

/** Page numbers to show: always the first, last, current and its neighbours; gaps become "…". */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const keep = new Set([1, pageCount, page - 1, page, page + 1]);
  // Near either end, widen the window so the row keeps a steady length instead of a lone "…" for one page.
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((n) => keep.add(n));
  const pages = [...keep].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const n of pages) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n - prev === 2) out.push(n - 1);
    else if (typeof prev === "number" && n - prev > 2) out.push("gap");
    out.push(n);
  }
  return out;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  href,
  noun = "items",
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
  noun?: string;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const summary = (
    <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
      Showing <span className="font-semibold text-foreground">{from.toLocaleString("en-US")}</span>–
      <span className="font-semibold text-foreground">{to.toLocaleString("en-US")}</span> of{" "}
      <span className="font-semibold text-foreground">{total.toLocaleString("en-US")}</span> {noun}
    </p>
  );
  if (pageCount <= 1) return summary;

  const step =
    "inline-flex h-10 items-center gap-1.5 rounded-full border border-foreground/12 bg-card px-3.5 text-sm font-semibold transition-colors hover:border-foreground/40";
  const disabled = "pointer-events-none opacity-40";
  const num =
    "inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors";

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {summary}
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={href(page - 1)} rel="prev" className={step} aria-label="Previous page">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span className={cn(step, disabled)} aria-hidden="true">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}

        {/* Phones: compact counter. Larger screens: numbered pages. */}
        <span className="px-2 text-sm font-semibold tabular-nums sm:hidden">
          {page} / {pageCount}
        </span>
        <ul className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, pageCount).map((n, i) =>
            n === "gap" ? (
              <li key={`gap-${i}`} className="w-6 text-center text-muted-foreground" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={n}>
                <Link
                  href={href(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    num,
                    n === page ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {n}
                </Link>
              </li>
            ),
          )}
        </ul>

        {page < pageCount ? (
          <Link href={href(page + 1)} rel="next" className={step} aria-label="Next page">
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={cn(step, disabled)} aria-hidden="true">
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="size-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
