"use server";

import { refresh, updateTag } from "next/cache";
import type { FormState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/session";
import { getOrder, syncPaymentStatus } from "@/lib/checkout/payment";
import { CATALOG_TAG } from "@/lib/repository";

const RESULT: Record<"paid" | "pending" | "failed" | "reversed", FormState> = {
  paid: { ok: true, message: "Pesapal confirms this order is paid. Stock and the customer's email are taken care of." },
  pending: {
    ok: true,
    message: "Pesapal hasn't received a payment for this order yet. If the customer says they paid, check again in a few minutes.",
  },
  failed: { ok: true, message: "Pesapal says this payment didn't go through. No money was taken." },
  reversed: { ok: true, message: "Pesapal says this payment was reversed. The pieces have gone back into stock." },
};

/**
 * Asks Pesapal for an order's payment status and saves it: the same check
 * the confirmation page runs, for when the customer never came back and the
 * IPN didn't arrive.
 */
export async function checkPayment(orderNumber: string): Promise<FormState> {
  await requireAdmin();

  const order = await getOrder(orderNumber);
  if (!order) return { ok: false, message: "This order no longer exists." };
  if (order.status === "paid" || order.status === "reversed") {
    refresh();
    return RESULT[order.status];
  }
  if (!order.pesapalTrackingId) {
    return {
      ok: false,
      message: "This order never reached Pesapal's payment page, so there's no payment to check.",
    };
  }

  let status: keyof typeof RESULT;
  try {
    status = await syncPaymentStatus(orderNumber, order.pesapalTrackingId);
  } catch (error) {
    console.error("[admin] payment check failed", orderNumber, error);
    return { ok: false, message: "Couldn't reach Pesapal just now. Please try again in a moment." };
  }

  // A payment changes stock levels, so the storefront should catch up too.
  if (status !== order.status) updateTag(CATALOG_TAG);
  refresh();
  return RESULT[status];
}
