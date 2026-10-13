import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Price({
  product,
  className,
  size = "sm",
}: {
  product: Pick<Product, "price" | "unit">;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <p className={cn("flex items-baseline gap-1.5", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "lg" ? "text-2xl tracking-tight" : "text-[0.9375rem]",
        )}
      >
        {formatPrice(product.price)}
      </span>
      <span className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>
        / {product.unit}
      </span>
    </p>
  );
}
