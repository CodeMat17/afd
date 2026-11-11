"use client";

import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextAreaField, TextField, focusFirstInvalid } from "@/components/forms/field";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { startCheckout } from "@/app/checkout/actions";
import { cartLineImage, useCart } from "@/lib/cart/use-cart";
import { computeTotals, formatRate, type CheckoutSettings, type Fulfilment } from "@/lib/checkout/pricing";
import { formatCents, lineTotalCents } from "@/lib/money";
import type { ServiceResult } from "@/lib/services";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { checkoutSchema, formDataToObject, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { unitLabel, whatsappUrl } from "@/lib/whatsapp";

type Status =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "redirecting" }
  | {
      kind: "result";
      result: ServiceResult<{ orderNumber: string; redirectUrl: string }>;
    };

const reveal = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
} as const;

const optionCard =
  "flex cursor-pointer gap-4 rounded-2xl border bg-surface p-4 transition-colors has-checked:border-foreground";

export function CheckoutForm({ products, settings }: { products: Product[]; settings: CheckoutSettings }) {
  const cart = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [taxReady, setTaxReady] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const lines = cart.lines.filter((l) => byId.get(l.productId)?.isAvailable);
  // Display only — the server reprices from the catalogue before charging.
  const totals = computeTotals({
    lines: lines.map((l) => ({ price: l.product.price, quantity: l.quantity })),
    taxDeclared: taxReady,
    fulfilment,
    settings,
  });
  const taxRate = formatRate(settings.taxRateBps);
  const shippingFee = formatCents(BigInt(settings.shippingFeeCents));

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
    const values = formDataToObject(new FormData(form), ["readyToPayApplicableTaxes"]);
    let result: ServiceResult<{ orderNumber: string; redirectUrl: string }>;
    try {
      // The server reads the cart itself from Convex.
      result = await startCheckout({ values });
    } catch {
      result = {
        ok: false,
        reason: "error",
        message: "We couldn't reach the server. Please try again.",
      };
    }
    if (result.ok) {
      setStatus({ kind: "redirecting" });
      window.location.assign(result.data.redirectUrl);
      return;
    }
    setStatus({ kind: "result", result });
  };

  const busy = status.kind === "pending" || status.kind === "redirecting";

  const revalidate = () => {
    if (attempted && formRef.current) validate(formRef.current);
  };

  if (!cart.ready) {
    return <div className="h-[40rem] animate-pulse rounded-2xl bg-muted" aria-busy="true" />;
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
        (l) => `• ${l.product.name} (SKU ${l.product.sku}) — ${l.quantity} ${unitLabel(l.product.unit, l.quantity)}`,
      ),
    ].join("\n"),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
      <form ref={formRef} noValidate onSubmit={onSubmit} onChange={revalidate} className="space-y-10">
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

        <fieldset className="space-y-4">
          <legend className="font-heading text-3xl">Pickup or delivery</legend>
          <label htmlFor="fulfilment-pickup" className={optionCard}>
            <input
              id="fulfilment-pickup"
              name="fulfilment"
              type="radio"
              value="pickup"
              checked={fulfilment === "pickup"}
              onChange={() => setFulfilment("pickup")}
              className="mt-0.5 size-5 shrink-0 accent-(--terracotta)"
            />
            <span className="flex-1 text-sm leading-relaxed">
              <span className="flex justify-between gap-4 font-semibold">
                Pick up from the showroom <span>Free</span>
              </span>
              <span className="text-muted-foreground">
                {site.address.street}, {site.address.city}
              </span>
            </span>
          </label>
          <label htmlFor="fulfilment-delivery" className={optionCard}>
            <input
              id="fulfilment-delivery"
              name="fulfilment"
              type="radio"
              value="delivery"
              checked={fulfilment === "delivery"}
              onChange={() => setFulfilment("delivery")}
              aria-controls="delivery-address-panel"
              className="mt-0.5 size-5 shrink-0 accent-(--terracotta)"
            />
            <span className="flex-1 text-sm leading-relaxed">
              <span className="flex justify-between gap-4 font-semibold">
                Ship to my address <span className="tabular-nums">{shippingFee}</span>
              </span>
              <span className="text-muted-foreground">Flat shipping fee added to your total.</span>
            </span>
          </label>
        </fieldset>

        <AnimatePresence initial={false}>
          {fulfilment === "delivery" ? (
            <motion.div id="delivery-address-panel" {...reveal} className="overflow-hidden">
              <fieldset className="space-y-5 pt-1">
                <legend className="font-heading text-3xl">Delivery address</legend>
                <TextField
                  id="addressLine1"
                  label="Address line 1"
                  autoComplete="address-line1"
                  error={errors.addressLine1}
                />
                <TextField
                  id="addressLine2"
                  label="Address line 2"
                  optional
                  autoComplete="address-line2"
                  error={errors.addressLine2}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField id="city" label="City" autoComplete="address-level2" error={errors.city} />
                  <TextField
                    id="region"
                    label="Region / state"
                    optional
                    autoComplete="address-level1"
                    error={errors.region}
                  />
                  <TextField
                    id="postalCode"
                    label="Postal code"
                    optional
                    autoComplete="postal-code"
                    error={errors.postalCode}
                  />
                  <TextField id="country" label="Country" autoComplete="country-name" error={errors.country} />
                </div>
              </fieldset>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <fieldset className="space-y-5">
          <legend className="sr-only">Order notes</legend>
          <TextAreaField
            id="notes"
            label="Order notes"
            optional
            rows={3}
            placeholder="Colour confirmations, pickup or delivery instructions…"
            error={errors.notes}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-3xl">Tax</legend>
          <label
            htmlFor="readyToPayApplicableTaxes"
            className="flex cursor-pointer gap-4 rounded-2xl border bg-surface p-4 transition-colors has-checked:border-foreground"
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
              I am a local customer, ready to provide my Tax ID and pay {taxRate} tax on the product subtotal of this
              order.
            </span>
          </label>

          <AnimatePresence initial={false}>
            {taxReady ? (
              <motion.div id="tax-id-panel" {...reveal} className="overflow-hidden">
                <TextField
                  id="taxId"
                  label="Tax ID number"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  autoComplete="off"
                  error={errors.taxId}
                  hint="Required when this box is ticked. It's stored with your order for invoicing and is never saved in your browser."
                  className="pt-1"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <p className="text-xs leading-relaxed text-muted-foreground">
            International customers can leave this unticked.
          </p>
        </fieldset>

        <div className="space-y-4">
          {Object.keys(errors).length > 0 && attempted ? (
            <FormAlert tone="error" title="Please check the highlighted fields">
              {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field needs" : "fields need"} attention.
            </FormAlert>
          ) : null}

          {status.kind === "result" && !status.result.ok ? (
            <FormAlert tone="error" title="Payment couldn't start">
              {status.result.message} You can also send your order to the showroom on WhatsApp.
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

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="size-4" aria-hidden="true" />
            )}
            {status.kind === "pending"
              ? "Preparing payment…"
              : status.kind === "redirecting"
                ? "Opening Pesapal…"
                : `Pay ${formatCents(totals.totalCents)} with Pesapal`}
          </Button>
          <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
          </Link>
        </div>
      </form>

      <aside
        aria-labelledby="checkout-summary"
        className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start"
      >
        <div className="rounded-2xl border bg-surface p-6">
          <h2 id="checkout-summary" className="font-heading text-3xl">
            Summary
          </h2>
          <ul className="mt-6 divide-y">
            {lines.map((l) => {
              const image = cartLineImage(l.product);
              return (
                <li key={l.productId} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {image ? <Image src={image.imageUrl} alt="" fill sizes="60px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold leading-snug">{l.product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {l.quantity} {unitLabel(l.product.unit, l.quantity)} · SKU {l.product.sku}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCents(lineTotalCents(l.product.price, l.quantity))}
                  </p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-3 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatCents(totals.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{fulfilment === "pickup" ? "Showroom pickup" : "Shipping"}</dt>
              <dd className="tabular-nums">{fulfilment === "pickup" ? "Free" : formatCents(totals.shippingCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax{taxReady ? ` (${taxRate})` : ""}</dt>
              <dd className={cn("tabular-nums", !taxReady && "text-muted-foreground")}>
                {taxReady ? formatCents(totals.taxCents) : "Not applied"}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold tabular-nums">{formatCents(totals.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            All prices in USD. You&apos;ll complete payment securely on Pesapal.
            {settings.shippingFeeIsPlaceholder
              ? " The shipping fee shown is a placeholder until the store sets it."
              : ""}
          </p>
        </div>
      </aside>
    </div>
  );
}
