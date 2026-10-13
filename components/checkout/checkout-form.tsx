"use client";

import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextAreaField, TextField, focusFirstInvalid } from "@/components/forms/field";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { PreviewNotice } from "@/components/ui/section";
import { useCart } from "@/lib/cart/use-cart";
import { formatCents, lineTotalCents, sumCents } from "@/lib/money";
import { orderService, type ServiceResult } from "@/lib/services";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { checkoutSchema, formDataToObject, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { unitLabel, whatsappUrl } from "@/lib/whatsapp";

type Status = { kind: "idle" } | { kind: "pending" } | { kind: "result"; result: ServiceResult<{ orderNumber: string }> };

export function CheckoutForm({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const cart = useCart();
  const { reconcile } = cart;
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [taxReady, setTaxReady] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  useEffect(() => reconcile(products), [products, reconcile]);

  const lines = cart.lines.filter((l) => byId.get(l.productId)?.isAvailable);
  const subtotal = sumCents(lines.map((l) => lineTotalCents(l.snapshot.price, l.quantity)));

  const validate = (form: HTMLFormElement) => {
    const values = formDataToObject(new FormData(form), ["readyToPayApplicableTaxes"]);
    const parsed = checkoutSchema.safeParse(values);
    const next = parsed.success ? {} : toFieldErrors(parsed.error);
    setErrors(next);
    return parsed.success;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setAttempted(true);
    if (!validate(form)) {
      setStatus({ kind: "idle" });
      window.setTimeout(() => focusFirstInvalid(form), 0);
      return;
    }
    setStatus({ kind: "pending" });
    // No trusted backend yet: this resolves to "not-configured" and nothing is stored.
    const result = await orderService.submitOrder();
    setStatus({ kind: "result", result });
  };

  const revalidate = () => {
    if (attempted && formRef.current) validate(formRef.current);
  };

  if (!hydrated) {
    return <div className="h-[40rem] animate-pulse rounded-md bg-muted" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="font-heading text-4xl">Nothing to check out</h2>
        <p className="mt-3 text-sm text-muted-foreground">Your cart is empty or its items are unavailable.</p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Shop the collection
        </Link>
      </div>
    );
  }

  const whatsappOrder = whatsappUrl(
    [
      `Hello ${site.name}, I'd like to order:`,
      ...lines.map(
        (l) => `• ${l.snapshot.name} (SKU ${l.snapshot.sku}) — ${l.quantity} ${unitLabel(l.snapshot.unit, l.quantity)}`,
      ),
    ].join("\n"),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
      <form ref={formRef} noValidate onSubmit={onSubmit} onChange={revalidate} className="space-y-10">
        <PreviewNotice title="Checkout preview">
          Online ordering and payment aren&apos;t connected yet. You can review the form, but no order
          will be placed, stored or charged. Once accounts launch, you&apos;ll{" "}
          <Link href="/account/sign-in" className="font-semibold text-foreground underline underline-offset-4">
            sign in
          </Link>{" "}
          to check out.
        </PreviewNotice>

        <fieldset className="space-y-5">
          <legend className="font-heading text-3xl">Contact</legend>
          <TextField id="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="email" type="email" label="Email" autoComplete="email" error={errors.email} />
            <TextField
              id="phone"
              type="tel"
              label="Phone"
              autoComplete="tel"
              placeholder="+254 …"
              error={errors.phone}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-heading text-3xl">Delivery address</legend>
          <TextField id="addressLine1" label="Address line 1" autoComplete="address-line1" error={errors.addressLine1} />
          <TextField id="addressLine2" label="Address line 2" optional autoComplete="address-line2" error={errors.addressLine2} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="city" label="City" autoComplete="address-level2" error={errors.city} />
            <TextField id="region" label="Region / state" optional autoComplete="address-level1" error={errors.region} />
            <TextField id="postalCode" label="Postal code" optional autoComplete="postal-code" error={errors.postalCode} />
            <TextField id="country" label="Country" autoComplete="country-name" error={errors.country} />
          </div>
          <TextAreaField
            id="notes"
            label="Order notes"
            optional
            rows={3}
            placeholder="Colour confirmations, delivery instructions…"
            error={errors.notes}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-3xl">Tax declaration</legend>
          <label
            htmlFor="readyToPayApplicableTaxes"
            className="flex cursor-pointer gap-4 rounded-md border bg-surface p-4 transition-colors has-checked:border-foreground"
          >
            <input
              id="readyToPayApplicableTaxes"
              name="readyToPayApplicableTaxes"
              type="checkbox"
              checked={taxReady}
              onChange={(e) => {
                setTaxReady(e.target.checked);
                // Unchecking hides the field and clears the value.
                if (!e.target.checked) setTaxId("");
              }}
              aria-controls="tax-id-panel"
              className="mt-0.5 size-5 shrink-0 accent-(--terracotta)"
            />
            <span className="text-sm leading-relaxed">
              I am ready to provide my Tax ID and pay any applicable VAT or taxes on this order.
            </span>
          </label>

          <AnimatePresence initial={false}>
            {taxReady ? (
              <motion.div
                id="tax-id-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <TextField
                  id="taxId"
                  label="Tax ID number"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  autoComplete="off"
                  error={errors.taxId}
                  hint="Required when this box is ticked. It will be verified on our side before an order is confirmed, and is never saved in your browser."
                  className="pt-1"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Tax treatment and shipping costs must be confirmed before a final total can be
            calculated. Ticking this box does not opt you out of any tax that legally applies.
          </p>
        </fieldset>

        <div className="space-y-4">
          {Object.keys(errors).length > 0 && attempted ? (
            <FormAlert tone="error" title="Please check the highlighted fields">
              {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field needs" : "fields need"} attention.
            </FormAlert>
          ) : null}

          {status.kind === "result" && !status.result.ok ? (
            <FormAlert title="Ordering isn't open yet">
              {status.result.message} Your details look complete — to buy now, send your cart to the
              showroom on WhatsApp.
              <a
                href={whatsappOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 font-semibold text-whatsapp"
              >
                <WhatsAppIcon className="size-4" />
                Send order details on WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </FormAlert>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={status.kind === "pending"}>
            {status.kind === "pending" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="size-4" aria-hidden="true" />
            )}
            {status.kind === "pending" ? "Checking…" : "Review & place order"}
          </Button>
          <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
          </Link>
        </div>
      </form>

      <aside aria-labelledby="checkout-summary" className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
        <div className="rounded-md border bg-surface p-6">
          <h2 id="checkout-summary" className="font-heading text-3xl">
            Summary
          </h2>
          <ul className="mt-6 divide-y">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 py-4 first:pt-0">
                <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {l.snapshot.imageUrl ? (
                    <Image src={l.snapshot.imageUrl} alt="" fill sizes="60px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold leading-snug">{l.snapshot.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.quantity} {unitLabel(l.snapshot.unit, l.quantity)} · SKU {l.snapshot.sku}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatCents(lineTotalCents(l.snapshot.price, l.quantity))}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatCents(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">To be confirmed</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Taxes</dt>
              <dd className="text-muted-foreground">To be confirmed</dd>
            </div>
          </dl>
          <p className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            All prices in USD. Final totals require confirmation of shipping and tax rules.
          </p>
        </div>
      </aside>
    </div>
  );
}
