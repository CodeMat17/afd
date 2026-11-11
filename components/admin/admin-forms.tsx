"use client";

import { Calculator, Loader2, Lock, Percent, Truck } from "lucide-react";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { login, saveSettings, type FormState } from "@/app/admin/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { formatCents, toCents } from "@/lib/money";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <TextField
        id="password"
        type="password"
        label="Admin password"
        autoComplete="current-password"
        autoFocus
      />
      {state && !state.ok ? <FormAlert tone="error" title={state.message} /> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

/** "16.5" → 1650 cents-style integer, or null while the field is mid-edit or invalid. */
function parseAmount(value: string, max: number): bigint | null {
  const v = value.trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(v) || Number(v) > max) return null;
  return toCents(v);
}

const SAMPLE_SUBTOTAL = BigInt(10_000); // $100.00

export function SettingsForm({
  taxRate,
  shippingFee,
  shippingFeeIsPlaceholder,
}: {
  taxRate: string;
  shippingFee: string;
  shippingFeeIsPlaceholder: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, null);
  const [tax, setTax] = useState(taxRate);
  const [fee, setFee] = useState(shippingFee);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Saved", { description: state.message });
    else toast.error("Not saved", { description: state.message, duration: 7000 });
  }, [state]);

  // Live example so it's obvious what a change means for a real customer.
  const taxBps = parseAmount(tax, 100);
  const feeCents = parseAmount(fee, 9_999_999);
  const taxCents = taxBps === null ? null : (SAMPLE_SUBTOTAL * taxBps + BigInt(5_000)) / BigInt(10_000);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {shippingFeeIsPlaceholder ? (
          <FormAlert tone="error" title="Your delivery fee hasn't been set yet">
            Checkout is using a placeholder amount. Enter your real fee below and save.
          </FormAlert>
        ) : null}

        <SettingCard
          icon={Truck}
          title="Delivery fee"
          description="A flat amount added when a customer chooses delivery. Showroom pickup is always free."
        >
          <TextField
            id="shippingFee"
            label="Delivery fee (USD)"
            inputMode="decimal"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            hint="For example 15 or 15.50."
          />
        </SettingCard>

        <SettingCard
          icon={Percent}
          title="Tax rate"
          description="Added to the product subtotal only when a local customer ticks the tax box and enters a Tax ID."
        >
          <TextField
            id="taxRate"
            label="Tax rate (%)"
            inputMode="decimal"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            hint="A percentage between 0 and 100, for example 16."
          />
        </SettingCard>

        {state && !state.ok ? (
          <FormAlert tone="error" title="Not saved">
            {state.message}
          </FormAlert>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <p className="text-xs text-muted-foreground">New orders use the new values straight away.</p>
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-band p-5 text-band-foreground lg:sticky lg:top-8">
        <div className="flex items-center gap-2.5">
          <Calculator className="size-4" aria-hidden="true" />
          <p className="text-sm font-semibold">How a customer is charged</p>
        </div>
        <p className="mt-1 text-xs text-band-muted">Example: a $100 order, delivered, with a Tax ID.</p>
        <dl className="mt-5 space-y-2.5 text-sm">
          <Line label="Products" value={formatCents(SAMPLE_SUBTOTAL)} />
          <Line label="Delivery" value={feeCents === null ? "—" : formatCents(feeCents)} />
          <Line label={`Tax${taxBps === null ? "" : ` (${tax.trim()}%)`}`} value={taxCents === null ? "—" : formatCents(taxCents)} />
          <div className="flex items-baseline justify-between border-t border-band-foreground/15 pt-3">
            <dt className="font-semibold">Customer pays</dt>
            <dd className="font-heading text-3xl leading-none font-medium tabular-nums">
              {feeCents === null || taxCents === null ? "—" : formatCents(SAMPLE_SUBTOTAL + feeCents + taxCents)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-band-muted">
          With showroom pickup and no Tax ID, they pay just {formatCents(SAMPLE_SUBTOTAL)}.
        </p>
      </aside>
    </form>
  );
}

function SettingCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgb(52_45_40/0.04),0_12px_32px_-20px_rgb(52_45_40/0.18)] ring-1 ring-foreground/[0.07] sm:p-6">
      <div className="mb-5 flex gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-[1.125rem]" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-2xl leading-tight font-medium">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-band-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
