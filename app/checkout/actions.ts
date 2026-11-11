"use server";

import { ConvexError } from "convex/values";
import { z } from "zod";
import { centsToAmount, computeTotals } from "@/lib/checkout/pricing";
import { getCheckoutSettings } from "@/lib/checkout/settings";
import { api, convexClient, isConvexConfigured, serverSecret } from "@/lib/convex/server";
import { loadCart, readCartId } from "@/lib/cart/server";
import { lineTotalCents, normaliseQuantity, toQty } from "@/lib/money";
import { isPesapalConfigured, submitOrderRequest } from "@/lib/pesapal/client";
import { catalog } from "@/lib/repository";
import type { ServiceResult } from "@/lib/services";
import { site } from "@/lib/site";
import { checkoutSchema } from "@/lib/validation";

const inputSchema = z.object({
  values: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export type StartCheckoutInput = z.infer<typeof inputSchema>;

/**
 * Creates a pending order priced from the catalogue and current settings,
 * registers it with Pesapal, and returns the hosted payment page URL.
 */
export async function startCheckout(
  input: StartCheckoutInput,
): Promise<ServiceResult<{ orderNumber: string; redirectUrl: string }>> {
  if (!isConvexConfigured() || !isPesapalConfigured()) {
    return {
      ok: false,
      reason: "not-configured",
      message: "Online payment isn't configured on this server yet.",
    };
  }

  const parsedInput = inputSchema.safeParse(input);
  if (!parsedInput.success) return invalid("Your cart couldn't be read. Please refresh and try again.");
  const form = checkoutSchema.safeParse(parsedInput.data.values);
  if (!form.success) return invalid("Some checkout details are missing or invalid.");
  const details = form.data;

  // The cart is read from Convex, never taken from the browser.
  const lines = await loadCart(await readCartId());
  if (lines.length === 0) return invalid("Your cart is empty.");

  // Authoritative prices and quantity rules come from the catalogue.
  const products = await catalog.getProductsByIds(lines.map((l) => l.productId));
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    // Sold-out lines stay in the cart (shown as unavailable) but aren't charged.
    if (!product || !product.isAvailable) continue;
    const quantity = normaliseQuantity(line.quantity, product.minimumQuantity, product.quantityStep);
    if (toQty(quantity) !== toQty(line.quantity)) {
      return invalid(`The quantity for ${product.name} needs updating. Please review your cart.`);
    }
    // Stock is only enforced for products that track it (null = not tracked).
    if (product.stockQuantity !== null && toQty(quantity) > toQty(product.stockQuantity)) {
      const left = product.stockQuantity;
      return invalid(
        toQty(left) > BigInt(0)
          ? `Only ${left} ${left === "1" ? "piece" : "pieces"} of ${product.name} ${left === "1" ? "is" : "are"} left. Please reduce the quantity in your cart.`
          : `${product.name} has just sold out. Please remove it from your cart.`,
      );
    }
    items.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      unitPrice: product.price,
      quantity,
      lineTotalCents: lineTotalCents(product.price, quantity).toString(),
    });
  }

  if (items.length === 0) return invalid("The items in your cart are no longer available. Please review your cart.");

  const settings = await getCheckoutSettings();
  const taxDeclared = details.readyToPayApplicableTaxes;
  const totals = computeTotals({
    lines: items.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
    taxDeclared,
    fulfilment: details.fulfilment,
    settings,
  });
  if (totals.totalCents <= BigInt(0)) return invalid("Your order total must be greater than zero.");

  const orderNumber = generateOrderNumber();
  const delivery = details.fulfilment === "delivery";
  const secret = serverSecret();
  const convex = convexClient();

  try {
    // Re-checks stock live inside Convex; the catalogue above may be cached.
    await convex.mutation(api.orders.create, {
      serverSecret: secret,
      orderNumber,
      fullName: details.fullName,
      email: details.email,
      phone: details.phone,
      fulfilment: details.fulfilment,
      address: delivery
        ? {
            line1: details.addressLine1 ?? "",
            line2: details.addressLine2 || undefined,
            city: details.city ?? "",
            region: details.region || undefined,
            postalCode: details.postalCode || undefined,
            country: details.country ?? "",
          }
        : undefined,
      notes: details.notes || undefined,
      taxDeclared,
      taxId: taxDeclared ? details.taxId || undefined : undefined,
      taxRateBps: settings.taxRateBps,
      items,
      subtotalCents: totals.subtotalCents.toString(),
      taxCents: totals.taxCents.toString(),
      shippingCents: totals.shippingCents.toString(),
      totalCents: totals.totalCents.toString(),
    });

    const [firstName, ...rest] = details.fullName.trim().split(/\s+/);
    const lastName = rest.pop() ?? firstName;
    const payment = await submitOrderRequest({
      merchantReference: orderNumber,
      amount: centsToAmount(totals.totalCents),
      currency: "USD",
      description: `${site.name} order ${orderNumber}`,
      callbackUrl: `${siteUrl()}/checkout/confirmation/${orderNumber}`,
      billing: {
        email: details.email,
        phone: details.phone.replace(/[^\d+]/g, ""),
        firstName,
        middleName: rest.join(" ") || undefined,
        lastName,
        line1: delivery ? details.addressLine1 : undefined,
        line2: delivery ? details.addressLine2 : undefined,
        city: delivery ? details.city : undefined,
        state: delivery ? details.region : undefined,
        postalCode: delivery ? details.postalCode : undefined,
      },
    });

    await convex.mutation(api.orders.attachTracking, {
      serverSecret: secret,
      orderNumber,
      trackingId: payment.orderTrackingId,
    });

    return { ok: true, data: { orderNumber, redirectUrl: payment.redirectUrl } };
  } catch (error) {
    // Raised by orders.create before anything is sent to Pesapal, e.g. "only 2 left".
    if (error instanceof ConvexError && typeof error.data === "string") return invalid(error.data);
    console.error("[checkout] failed to start payment", orderNumber, error);
    return {
      ok: false,
      reason: "error",
      message: "We couldn't start the payment. Nothing has been charged — please try again.",
    };
  }
}

function invalid(message: string): ServiceResult<never> {
  return { ok: false, reason: "error", message };
}

function siteUrl(): string {
  return (process.env.SITE_URL ?? site.url).replace(/\/+$/, "");
}

/** e.g. AFD-7KQ2M9XW — unambiguous characters, ~40 bits of randomness. */
function generateOrderNumber(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `AFD-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
