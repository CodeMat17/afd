/**
 * Checkout totals. Shared by the summary UI (display) and the checkout server
 * action (authoritative — always fed catalogue prices, never cart snapshots).
 */
import { lineTotalCents, sumCents } from "@/lib/money";

export type Fulfilment = "pickup" | "delivery";

export interface CheckoutSettings {
  /** Basis points: 1600 = 16%. */
  taxRateBps: number;
  /** Integer cents as a string. */
  shippingFeeCents: string;
  shippingFeeIsPlaceholder: boolean;
}

export interface Totals {
  subtotalCents: bigint;
  taxCents: bigint;
  shippingCents: bigint;
  totalCents: bigint;
}

export function computeTotals({
  lines,
  taxDeclared,
  fulfilment,
  settings,
}: {
  lines: { price: string; quantity: string }[];
  taxDeclared: boolean;
  fulfilment: Fulfilment;
  settings: Pick<CheckoutSettings, "taxRateBps" | "shippingFeeCents">;
}): Totals {
  const subtotalCents = sumCents(lines.map((l) => lineTotalCents(l.price, l.quantity)));
  const taxCents = taxDeclared ? percentOf(subtotalCents, settings.taxRateBps) : BigInt(0);
  const shippingCents = fulfilment === "delivery" ? BigInt(settings.shippingFeeCents) : BigInt(0);
  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents: subtotalCents + taxCents + shippingCents,
  };
}

/** amount × bps / 10000, rounded half up to the cent. */
function percentOf(amount: bigint, bps: number): bigint {
  const scale = BigInt(10000);
  return (amount * BigInt(bps) + scale / BigInt(2)) / scale;
}

/** 2500 → "25%", 1650 → "16.5%". */
export function formatRate(bps: number): string {
  return `${Number((bps / 100).toFixed(2))}%`;
}

/** Integer cents → plain decimal string, e.g. 12345n → "123.45". */
export function centsToAmount(cents: bigint): string {
  const whole = cents / BigInt(100);
  const fraction = (cents % BigInt(100)).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
}
