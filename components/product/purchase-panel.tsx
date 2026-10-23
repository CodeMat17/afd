"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { addToCartWithNotice } from "@/components/product/product-card";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCents, lineTotalCents } from "@/lib/money";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { productEnquiryUrl, unitLabel } from "@/lib/whatsapp";

export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const units = unitLabel(product.unit, quantity);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] uppercase">
            Quantity <span className="font-normal tracking-normal text-muted-foreground normal-case">({units})</span>
          </p>
          <QuantityStepper
            id={`qty-${product.id}`}
            value={quantity}
            minimum={product.minimumQuantity}
            step={product.quantityStep}
            unitLabel={unitLabel(product.unit, "2")}
            label={`Quantity of ${product.name}`}
            onChange={setQuantity}
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Line total</p>
          <p className="font-heading text-2xl leading-none font-medium tabular-nums lining-nums" aria-live="polite">
            {formatCents(lineTotalCents(product.price, quantity))}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <Button
          size="lg"
          disabled={!product.isAvailable}
          onClick={() => addToCartWithNotice(product, quantity)}
          className="w-full"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {product.isAvailable ? "Add to cart" : "Sold out"}
        </Button>
        <a
          href={productEnquiryUrl(product, quantity)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "w-full")}
        >
          <WhatsAppIcon className="size-4" />
          Ask on WhatsApp
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
