import { stockStatus } from "@/lib/admin/stock";
import { cn } from "@/lib/utils";

/** "12 in stock" / "2 left" / "Out of stock" / "Not tracked", coloured by urgency. */
export function StockBadge({ stockQuantity, className }: { stockQuantity: string | null; className?: string }) {
  const status = stockStatus(stockQuantity);
  const n = Number(stockQuantity);
  const label =
    status === "untracked"
      ? "Not tracked"
      : status === "out"
        ? "Out of stock"
        : status === "low"
          ? `${n} left`
          : `${n} in stock`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums",
        status === "out" && "border-destructive/30 bg-destructive/10 text-destructive",
        status === "low" && "border-gold/40 bg-gold/10 text-gold",
        status === "ok" && "border-border text-foreground",
        status === "untracked" && "border-dashed border-border text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "out" && "bg-destructive",
          status === "low" && "bg-gold",
          status === "ok" && "bg-emerald-600",
          status === "untracked" && "bg-muted-foreground/50",
        )}
      />
      {label}
    </span>
  );
}
