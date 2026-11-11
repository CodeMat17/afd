import { formatCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface SalesDay {
  /** "Tue 4 Nov" — shown in the tooltip and the table. */
  label: string;
  /** "4 Nov" — the axis label. */
  short: string;
  cents: bigint;
  orders: number;
  isToday: boolean;
}

/** Rounds the top of the scale up to a tidy dollar figure (1, 2, 2.5 or 5 × 10ⁿ). */
function niceCeiling(cents: bigint): number {
  const dollars = Number(cents) / 100;
  if (dollars <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(dollars));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= dollars) ?? 10;
  return step * magnitude;
}

const axisMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Daily paid sales as bars. Pure HTML/CSS: hover (or tap) a day for its
 * figures; screen readers get the same numbers as a table.
 */
export function SalesChart({ days }: { days: SalesDay[] }) {
  const top = niceCeiling(days.reduce((max, d) => (d.cents > max ? d.cents : max), BigInt(0)));
  const ticks = [top, top / 2, 0];
  const labelEvery = Math.ceil(days.length / 6);

  return (
    <figure>
      <div aria-hidden="true" className="flex gap-3">
        {/* Y axis */}
        <div className="relative w-10 shrink-0 text-right text-[0.6875rem] text-muted-foreground tabular-nums">
          {ticks.map((t, i) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            >
              {axisMoney.format(t)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-52 sm:h-60">
            {/* Grid */}
            {ticks.map((t, i) => (
              <div
                key={t}
                className={cn(
                  "absolute inset-x-0 border-t",
                  i === ticks.length - 1 ? "border-foreground/20" : "border-dashed border-foreground/[0.08]",
                )}
                style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {days.map((d, i) => {
                const pct = Math.min(100, (Number(d.cents) / 100 / top) * 100);
                const align = i < 4 ? "left-0" : i > days.length - 5 ? "right-0" : "left-1/2 -translate-x-1/2";
                return (
                  <div key={d.label} className="group/bar relative flex h-full flex-1 items-end justify-center">
                    <div className="absolute inset-y-0 -inset-x-px rounded-md transition-colors group-hover/bar:bg-foreground/[0.04]" />
                    <div
                      className={cn(
                        "relative w-full max-w-7 rounded-t-[4px] transition-[filter] duration-200 group-hover/bar:brightness-110",
                        d.cents > BigInt(0) ? "bg-primary" : "bg-foreground/10",
                      )}
                      style={{ height: d.cents > BigInt(0) ? `max(${pct}%, 4px)` : "2px" }}
                    />
                    {/* Tooltip */}
                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-lg bg-ink px-3 py-2 text-left text-ink-foreground opacity-0 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)] transition-opacity duration-150 group-hover/bar:opacity-100",
                        align,
                      )}
                    >
                      <p className="text-[0.6875rem] text-ink-muted">
                        {d.label}
                        {d.isToday ? " · Today" : ""}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">{formatCents(d.cents)}</p>
                      <p className="text-[0.6875rem] text-ink-muted">
                        {d.orders} paid order{d.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="mt-2 flex gap-[2px] text-[0.6875rem] text-muted-foreground">
            {days.map((d, i) => (
              <div key={d.label} className="relative flex-1">
                {d.isToday || (i % labelEvery === 0 && i < days.length - 2) ? (
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                      d.isToday && "right-0 left-auto translate-x-0 font-semibold text-foreground",
                    )}
                  >
                    {d.isToday ? "Today" : d.short}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Paid sales per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Sales</th>
            <th scope="col">Paid orders</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{formatCents(d.cents)}</td>
              <td>{d.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
