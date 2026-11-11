import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { syncPaymentStatus } from "@/lib/checkout/payment";
import { CATALOG_TAG } from "@/lib/repository";

/**
 * Pesapal Instant Payment Notification. Registered (GET or POST) via
 * `yarn pesapal:register-ipn`. Pesapal retries until it receives status 200.
 */
async function handle(params: URLSearchParams) {
  const orderTrackingId = params.get("OrderTrackingId") ?? "";
  const orderMerchantReference = params.get("OrderMerchantReference") ?? "";
  const orderNotificationType = params.get("OrderNotificationType") ?? "IPNCHANGE";
  const ack = (status: 200 | 500) =>
    Response.json(
      { orderNotificationType, orderTrackingId, orderMerchantReference, status },
      { status: status === 200 ? 200 : 500 },
    );

  if (!orderTrackingId || !orderMerchantReference) return ack(500);
  try {
    await syncPaymentStatus(orderMerchantReference, orderTrackingId);
    // A payment (or reversal) changes stock levels; let the storefront catch
    // up so a sold-out piece stops showing "Add to cart".
    revalidateTag(CATALOG_TAG, "max");
    return ack(200);
  } catch (error) {
    console.error("[pesapal-ipn] failed", orderMerchantReference, error);
    return ack(500);
  }
}

export async function GET(request: NextRequest) {
  return handle(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => ({}));
  const params = new URLSearchParams(request.nextUrl.searchParams);
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") params.set(key, value);
    }
  }
  return handle(params);
}
