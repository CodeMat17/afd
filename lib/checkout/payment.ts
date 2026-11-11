import "server-only";

import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { getTransactionStatus } from "@/lib/pesapal/client";

/**
 * Reads the authoritative status from Pesapal and stores it on the order.
 * Never trust redirect/IPN query parameters on their own.
 */
export async function syncPaymentStatus(orderNumber: string, trackingId: string) {
  const status = await getTransactionStatus(trackingId);
  if (status.merchantReference && status.merchantReference !== orderNumber) {
    throw new Error(`Pesapal reference ${status.merchantReference} does not match ${orderNumber}.`);
  }
  return convexClient().mutation(api.orders.recordPayment, {
    serverSecret: serverSecret(),
    orderNumber,
    trackingId,
    status: status.status,
    paymentMethod: status.paymentMethod,
    paymentDescription: status.description,
    confirmationCode: status.confirmationCode,
    paidAmount:
      status.amount != null ? `${status.amount.toFixed(2)} ${status.currency ?? ""}`.trim() : undefined,
  });
}

export async function getOrder(orderNumber: string) {
  return convexClient().query(api.orders.getByOrderNumber, {
    serverSecret: serverSecret(),
    orderNumber,
  });
}
