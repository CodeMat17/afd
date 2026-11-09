"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { SaveButton } from "@/components/product/save-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { addToCart } from "@/lib/cart/add-to-cart";
import { formatCents, formatPrice, lineTotalCents } from "@/lib/money";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { productEnquiryUrl, unitLabel } from "@/lib/whatsapp";

export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const units = unitLabel(product.unit, quantity);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const mounted = useHydrated();
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];

  // Mobile: once the main buttons scroll above the viewport, offer a sticky bar.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const total = formatCents(lineTotalCents(product.price, quantity));

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
            {total}
          </p>
        </div>
      </div>

      <div ref={actionsRef} className="grid gap-3">
        <div className="flex gap-3">
          <Button
            size="lg"
            disabled={!product.isAvailable}
            onClick={() => addToCart(product, quantity)}
            className="flex-1"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {product.isAvailable ? "Add to cart" : "Sold out"}
          </Button>
          <SaveButton
            productId={product.id}
            productName={product.name}
            imageUrl={image?.imageUrl}
            variant="outline"
          />
        </div>
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

      {mounted ? createPortal(
      <AnimatePresence>
        {showBar && product.isAvailable ? (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-30px_rgb(0_0_0/0.5)] backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3">
              {image ? (
                <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={image.imageUrl} alt="" fill sizes="36px" className="object-cover" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {quantity} {units} · {formatPrice(product.price)} / {product.unit}
                </p>
              </div>
              <Button onClick={() => addToCart(product, quantity)} className="shrink-0">
                <ShoppingBag className="size-4" aria-hidden="true" />
                Add · {total}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
      ) : null}
    </div>
  );
}
