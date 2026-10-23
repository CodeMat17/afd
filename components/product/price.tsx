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
          "tabular-nums lining-nums",
          size === "lg"
            ? "font-heading text-[2.5rem] leading-none font-medium tracking-[-0.01em]"
            : "text-[0.9375rem] font-semibold",
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
