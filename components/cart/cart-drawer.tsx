"use client";

import { ArrowRight, Check, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Price } from "@/components/product/price";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { useCatalog } from "@/components/providers/catalog-provider";
import { buttonVariants } from "@/components/ui/button";
import { cartActions } from "@/lib/cart/store";
import { useCart } from "@/lib/cart/use-cart";
import { formatCents, lineTotalCents, sumCents } from "@/lib/money";
import { site } from "@/lib/site";
import { useLastAdded } from "@/lib/ui-store";
import { useOverlayDialog } from "@/lib/use-overlay-dialog";
import { cn } from "@/lib/utils";
import { unitLabel, whatsappUrl } from "@/lib/whatsapp";

/** Slide-over mini cart: opens on add-to-cart and from every cart button. */
export function CartDrawer() {
  const { ref, isOpen, close, onClose, onBackdropClick } = useOverlayDialog("cart");
  const { products, byId, categories } = useCatalog();
  const cart = useCart();
  const lastAdded = useLastAdded();

  // Local snapshots are never authoritative: refresh from the catalogue.
  useEffect(() => {
    cartActions.reconcile(products);
  }, [products]);

  const valid = cart.lines.filter((l) => byId.get(l.productId)?.isAvailable);
  const subtotal = sumCents(valid.map((l) => lineTotalCents(l.snapshot.price, l.quantity)));
  const justAdded = lastAdded ? cart.lines.find((l) => l.productId === lastAdded) : undefined;

  // Pair-with suggestions: same fabric families as the cart, not already in it.
  const suggestions = useMemo(() => {
    const inCart = new Set(cart.lines.map((l) => l.productId));
    const families = new Set(
      cart.lines.map((l) => byId.get(l.productId)?.categoryId).filter(Boolean),
    );
    return products
      .filter((p) => p.isAvailable && !inCart.has(p.id) && families.has(p.categoryId))
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
      .slice(0, 6);
  }, [cart.lines, byId, products]);

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
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-labelledby="cart-drawer-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-none translate-x-full bg-background p-0 text-foreground opacity-0 shadow-[-30px_0_80px_-40px_rgb(0_0_0/0.45)] transition-all transition-discrete duration-500 ease-silk open:translate-x-0 open:opacity-100 sm:w-[440px] starting:open:translate-x-full starting:open:opacity-0"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-5">
          <h2 id="cart-drawer-title" className="flex items-baseline gap-2 font-heading text-2xl">
            Your cart
            {cart.count > 0 ? (
              <span className="font-sans text-sm text-muted-foreground tabular-nums">
                ({cart.count} {cart.count === 1 ? "item" : "items"})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="-mr-2 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {isOpen && justAdded ? (
          <motion.p
            key={justAdded.productId}
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 border-b bg-olive/10 px-5 py-3 text-sm font-medium text-olive dark:text-secondary"
          >
            <Check className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Added {justAdded.snapshot.name}</span>
          </motion.p>
        ) : null}

        {cart.lines.length === 0 ? (
          <EmptyDrawer categories={categories} onNavigate={close} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y px-5">
                <AnimatePresence initial={false}>
                  {cart.lines.map((line) => {
                    const product = byId.get(line.productId);
                    const unavailable = !product || !product.isAvailable;
                    return (
                      <motion.li
                        key={line.productId}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[4.5rem_1fr] gap-4 py-5">
                          <Link
                            href={`/products/${line.snapshot.slug}`}
                            onClick={close}
                            tabIndex={-1}
                            aria-hidden="true"
                            className="relative aspect-17/23 overflow-hidden rounded-lg bg-muted"
                          >
                            {line.snapshot.imageUrl ? (
                              <Image src={line.snapshot.imageUrl} alt="" fill sizes="72px" className="object-cover" />
                            ) : null}
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <Link
                                href={`/products/${line.snapshot.slug}`}
                                onClick={close}
                                className="line-clamp-2 font-heading text-lg leading-tight hover:text-primary"
                              >
                                {line.snapshot.name}
                              </Link>
                              <p className="shrink-0 text-sm font-semibold tabular-nums">
                                {formatCents(lineTotalCents(line.snapshot.price, line.quantity))}
                              </p>
                            </div>
                            <Price product={line.snapshot} className="mt-0.5 [&>span:first-child]:text-xs [&>span:first-child]:font-normal [&>span:first-child]:text-muted-foreground" />
                            {unavailable ? (
                              <p className="mt-2 text-xs font-medium text-destructive">
                                {product ? "Sold out" : "No longer available"} — won&apos;t be included at checkout.
                              </p>
                            ) : null}
                            <div className="mt-3 flex items-center justify-between gap-2">
                              {!unavailable ? (
                                <QuantityStepper
                                  id={`drawer-qty-${line.productId}`}
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
                                aria-label={`Remove ${line.snapshot.name}`}
                                className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              {suggestions.length > 0 ? (
                <section aria-labelledby="pair-title" className="border-t py-6">
                  <h3 id="pair-title" className="eyebrow px-5 text-muted-foreground">
                    Pairs well with
                  </h3>
                  <ul className="scrollbar-none mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                    {suggestions.map((p) => {
                      const image = p.images[0];
                      return (
                        <li key={p.id} className="w-32 shrink-0 snap-start">
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={close}
                            className="relative block aspect-4/5 overflow-hidden rounded-lg bg-muted"
                            tabIndex={-1}
                            aria-hidden="true"
                          >
                            {image ? <Image src={image.imageUrl} alt="" fill sizes="128px" className="object-cover" /> : null}
                          </Link>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={close}
                            className="mt-2 line-clamp-1 text-xs font-semibold hover:text-primary"
                          >
                            {p.name}
                          </Link>
                          <div className="mt-1 flex items-center justify-between">
                            <Price product={p} className="[&>span:first-child]:text-xs" />
                            <button
                              type="button"
                              onClick={() => cartActions.add(p, p.minimumQuantity)}
                              aria-label={`Add ${p.name} to cart`}
                              className="flex size-8 items-center justify-center rounded-full border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              <Plus className="size-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </div>

            <div className="shrink-0 border-t bg-surface px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">Subtotal</p>
                <p className="font-heading text-3xl leading-none font-medium tabular-nums lining-nums">
                  {formatCents(subtotal)}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                USD. Shipping and any applicable taxes are confirmed before payment.
              </p>
              <div className="mt-4 grid gap-2.5">
                {valid.length > 0 ? (
                  <Link href="/checkout" onClick={close} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                    Checkout
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link href="/cart" onClick={close} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    View cart
                  </Link>
                  {valid.length > 0 ? (
                    <a
                      href={enquiry}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "whatsapp" }), "w-full")}
                    >
                      <WhatsAppIcon className="size-4" />
                      WhatsApp
                      <span className="sr-only">: send cart (opens in a new tab)</span>
                    </a>
                  ) : (
                    <button type="button" onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
                      Keep browsing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

function EmptyDrawer({
  categories,
  onNavigate,
}: {
  categories: { slug: string; name: string; imageUrl?: string }[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full border border-dashed border-foreground/30">
          <ShoppingBag className="size-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <p className="mt-5 font-heading text-3xl">Your cart is empty</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Add a fabric you love and it&apos;ll wait here while you keep browsing.
        </p>
        <Link href="/shop" onClick={onNavigate} className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          Shop the collection
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <p className="eyebrow mt-12 text-muted-foreground">Shop by fabric</p>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/shop/${c.slug}`} onClick={onNavigate} className="group flex items-center gap-3 rounded-lg border p-2 transition-colors hover:border-foreground">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                {c.imageUrl ? <Image src={c.imageUrl} alt="" fill sizes="40px" className="object-cover" /> : null}
              </span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
