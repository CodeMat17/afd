import "server-only";

import { connection } from "next/server";
import type { CheckoutSettings } from "@/lib/checkout/pricing";
import { api, convexClient, isConvexConfigured } from "@/lib/convex/server";

/** Mirrors DEFAULT_SETTINGS in convex/settings.ts, used before Convex is connected. */
const FALLBACK: CheckoutSettings = {
  taxRateBps: 1600,
  shippingFeeCents: "1500",
  shippingFeeIsPlaceholder: true,
};

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  if (!isConvexConfigured()) return FALLBACK;
  // Always read at request time: prices must match what the order is charged.
  await connection();
  const settings = await convexClient().query(api.settings.get, {});
  return {
    taxRateBps: settings.taxRateBps,
    shippingFeeCents: settings.shippingFeeCents,
    shippingFeeIsPlaceholder: settings.shippingFeeIsPlaceholder,
  };
}
