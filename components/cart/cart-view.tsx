"use client";

import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { PreviewNotice } from "@/components/ui/section";
import { useCart } from "@/lib/cart/use-cart";
import { formatCents, formatPrice, lineTotalCents, sumCents } from "@/lib/money";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { unitLabel, whatsappUrl } from "@/lib/whatsapp";

export function CartView({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const cart = useCart();
  const { reconcile } = cart;
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Refresh prices/names from the catalogue; local snapshots are never authoritative.
  useEffect(() => {
    reconcile(products);
  }, [products, reconcile]);

  const valid = cart.lines.filter((l) => byId.get(l.productId)?.isAvailable);
  const subtotal = sumCents(valid.map((l) => lineTotalCents(l.snapshot.price, l.quantity)));
  const hasUnavailable = valid.length !== cart.lines.length;

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]" aria-busy="true">
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-dashed border-foreground/30">
          <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-heading text-4xl">Your cart is empty</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Explore printed, woven and embellished fabrics — add anything you like and it will wait here.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Shop the collection
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const enquiry = whatsappUrl(
    [
      `Hello ${site.name}, I'd like to enquire about these items:`,
      ...valid.map(
        (l) =>
          `• ${l.snapshot.name} (SKU ${l.snapshot.sku}) — ${l.quantity} ${unitLabel(l.snapshot.unit, l.quantity)}`,
      ),
    ].join("\n"),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <section aria-labelledby="cart-items-title">
        <h2 id="cart-items-title" className="sr-only">
          Items in your cart
        </h2>
        <ul className="divide-y border-y">
          <AnimatePresence initial={false}>
            {cart.lines.map((line) => {
              const product = byId.get(line.productId);
              const unavailable = !product || !product.isAvailable;
              const total = lineTotalCents(line.snapshot.price, line.quantity);
              return (
                <motion.li
                  key={line.productId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
                    <Link
                      href={`/products/${line.snapshot.slug}`}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="relative aspect-17/23 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5"
                    >
                      {line.snapshot.imageUrl ? (
                        <Image src={line.snapshot.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-heading text-xl leading-tight sm:text-2xl">
                            <Link href={`/products/${line.snapshot.slug}`} className="hover:text-primary">
                              {line.snapshot.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            SKU {line.snapshot.sku} · {formatPrice(line.snapshot.price)} / {line.snapshot.unit}
                          </p>
                        </div>
                        <p className="shrink-0 text-right font-semibold tabular-nums">{formatCents(total)}</p>
                      </div>

                      {unavailable ? (
                        <p className="mt-3 text-sm font-medium text-destructive">
                          {product ? "This design is currently sold out." : "This design is no longer in the catalogue."}{" "}
                          It won&apos;t be included at checkout.
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        {!unavailable ? (
                          <QuantityStepper
                            id={`cart-qty-${line.productId}`}
                            value={line.quantity}
                            minimum={line.snapshot.minimumQuantity}
                            step={line.snapshot.quantityStep}
                            unitLabel={unitLabel(line.snapshot.unit, "2")}
                            label={`Quantity of ${line.snapshot.name}`}
                            onChange={(q) => cart.setQuantity(line.productId, q)}
                            size="sm"
                          />
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => cart.remove(line.productId)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove<span className="sr-only"> {line.snapshot.name}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
        >
          Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
        <div className="rounded-2xl border bg-surface p-6 shadow-[0_30px_60px_-40px_rgb(31_26_22/0.35)] sm:p-8">
          <h2 id="summary-title" className="font-heading text-3xl tracking-[-0.01em]">
            Order summary
          </h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Subtotal ({valid.length} {valid.length === 1 ? "item" : "items"})
              </dt>
              <dd className="font-semibold tabular-nums">{formatCents(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping &amp; taxes</dt>
              <dd className="text-right text-muted-foreground">To be confirmed</dd>
            </div>
          </dl>
          <div className="mt-6 flex items-baseline justify-between border-t pt-5">
            <p className="text-sm font-semibold">Estimated total</p>
            <p className="font-heading text-4xl leading-none font-medium tabular-nums lining-nums">{formatCents(subtotal)}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">USD, before shipping and any applicable taxes.</p>

          <div className="mt-6 grid gap-3">
            {valid.length > 0 ? (
              <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Continue to checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
            {valid.length > 0 ? (
              <a
                href={enquiry}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "w-full")}
              >
                <WhatsAppIcon className="size-4" />
                Send cart on WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
          {hasUnavailable ? (
            <p className="mt-4 text-xs text-destructive">Unavailable items are excluded from the total.</p>
          ) : null}
        </div>
        <PreviewNotice className="mt-4" title="Your cart is saved on this device">
          It&apos;s stored in this browser only, and isn&apos;t a reservation or an order.
          Prices are confirmed at checkout once ordering opens.
        </PreviewNotice>
      </aside>
    </div>
  );
}
