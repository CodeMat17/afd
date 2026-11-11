import { StockBadge } from "@/components/admin/stock-badge";
import { REASON_LABELS, type StockReason } from "@/lib/admin/stock";
import { cn } from "@/lib/utils";

export interface StockMovementRow {
  id: string;
  /** Pre-formatted on the server, in the showroom's time zone. */
  when: string;
  change: number;
  balance: number;
  reason: StockReason;
  note?: string;
  orderNumber?: string;
  shortfall?: number;
}

/**
 * Every change to a product's stock level: opening stock, counts saved from
 * the product form, and online sales and reversals (recorded automatically).
 * The level itself is edited in the product form.
 */
export function StockHistory({ stockQuantity, history }: { stockQuantity: string | null; history: StockMovementRow[] }) {
  return (
    <section
      aria-labelledby="stock-history-title"
      className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgb(52_45_40/0.04),0_12px_32px_-20px_rgb(52_45_40/0.18)] ring-1 ring-foreground/[0.07] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="stock-history-title" className="font-heading text-2xl font-medium">
            Stock history
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every change to the number of pieces, newest first. Online sales appear here automatically.
          </p>
        </div>
        <StockBadge stockQuantity={stockQuantity} />
      </div>

      {history.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 p-6 text-center text-sm text-muted-foreground">
          No stock changes recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-foreground/[0.06]">
          {history.map((m) => (
            <li key={m.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
              <span
                className={cn(
                  "w-14 shrink-0 rounded-lg py-1 text-center text-sm font-semibold tabular-nums",
                  m.change > 0 && "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300",
                  m.change < 0 && "bg-destructive/10 text-destructive",
                  m.change === 0 && "bg-muted text-muted-foreground",
                )}
              >
                {m.change > 0 ? `+${m.change}` : m.change === 0 ? "±0" : m.change}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  {REASON_LABELS[m.reason]}
                  {m.orderNumber ? <span className="font-normal text-muted-foreground"> · {m.orderNumber}</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.when}
                  {m.note ? ` · ${m.note}` : ""}
                </p>
                {m.shortfall ? (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    Oversold by {m.shortfall}: the order needed more pieces than were recorded. Check the shelf and
                    contact the customer if needed.
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-right text-sm tabular-nums">
                <span className="block font-semibold">{m.balance}</span>
                <span className="block text-xs text-muted-foreground">left</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
