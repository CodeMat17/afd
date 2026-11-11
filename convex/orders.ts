import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";
import { address, fulfilment, orderItem, orderStatus } from "./schema";
import { applyOrderToStock, assertInStock } from "./stock";

const cents = v.string();

export const create = mutation({
  args: {
    serverSecret: v.string(),
    orderNumber: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    fulfilment,
    address: v.optional(address),
    notes: v.optional(v.string()),
    taxDeclared: v.boolean(),
    taxId: v.optional(v.string()),
    taxRateBps: v.number(),
    items: v.array(orderItem),
    subtotalCents: cents,
    taxCents: cents,
    shippingCents: cents,
    totalCents: cents,
  },
  handler: async (ctx, { serverSecret, ...order }) => {
    assertServer(serverSecret);
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", order.orderNumber))
      .unique();
    if (existing) throw new ConvexError("Duplicate order number.");
    // Pieces aren't reserved while the customer pays; this only stops an
    // order for more than is on the shelf right now.
    await assertInStock(ctx, order.items);
    await ctx.db.insert("orders", {
      ...order,
      status: "pending",
      currency: "USD",
      updatedAt: Date.now(),
    });
  },
});

export const attachTracking = mutation({
  args: { serverSecret: v.string(), orderNumber: v.string(), trackingId: v.string() },
  handler: async (ctx, { serverSecret, orderNumber, trackingId }) => {
    assertServer(serverSecret);
    const order = await byNumber(ctx, orderNumber);
    await ctx.db.patch(order._id, { pesapalTrackingId: trackingId, updatedAt: Date.now() });
  },
});

/**
 * Applies a status read back from Pesapal. Idempotent, and a paid order is
 * only ever moved on to "reversed" — late or duplicate notifications can't
 * downgrade it.
 */
export const recordPayment = mutation({
  args: {
    serverSecret: v.string(),
    orderNumber: v.string(),
    trackingId: v.string(),
    status: orderStatus,
    paymentMethod: v.optional(v.string()),
    paymentDescription: v.optional(v.string()),
    confirmationCode: v.optional(v.string()),
    paidAmount: v.optional(v.string()),
  },
  handler: async (ctx, { serverSecret, orderNumber, trackingId, status, ...payment }) => {
    assertServer(serverSecret);
    const order = await byNumber(ctx, orderNumber);
    if (order.pesapalTrackingId && order.pesapalTrackingId !== trackingId) {
      throw new ConvexError("Tracking ID does not match this order.");
    }
    if (order.status === "paid" && status !== "reversed") return order.status;
    if (order.status === "reversed") return order.status;

    // Stock moves in the same transaction as the status, and `stockDeducted`
    // makes it happen exactly once per payment however many times Pesapal
    // (or the confirmation page) reports it.
    let stockDeducted = order.stockDeducted ?? false;
    if (status === "paid" && !stockDeducted) {
      await applyOrderToStock(ctx, order, -1);
      stockDeducted = true;
    } else if (status === "reversed" && stockDeducted) {
      await applyOrderToStock(ctx, order, 1);
      stockDeducted = false;
    }

    await ctx.db.patch(order._id, {
      ...payment,
      status,
      stockDeducted,
      pesapalTrackingId: trackingId,
      paidAt: status === "paid" ? Date.now() : order.paidAt,
      updatedAt: Date.now(),
    });
    return status;
  },
});

export const getByOrderNumber = query({
  args: { serverSecret: v.string(), orderNumber: v.string() },
  handler: async (ctx, { serverSecret, orderNumber }) => {
    assertServer(serverSecret);
    return ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .unique();
  },
});

export const list = query({
  args: { serverSecret: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { serverSecret, limit }) => {
    assertServer(serverSecret);
    return ctx.db
      .query("orders")
      .order("desc")
      .take(Math.min(Math.max(limit ?? 50, 1), 200));
  },
});

async function byNumber(ctx: MutationCtx, orderNumber: string) {
  const order = await ctx.db
    .query("orders")
    .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
    .unique();
  if (!order) throw new ConvexError("Order not found.");
  return order;
}

/**
 * Orders placed since `since` (ms), newest first, for the dashboard's sales
 * figures. Reads the built-in creation-time index, so only that window is scanned.
 */
export const since = query({
  args: { serverSecret: v.string(), since: v.number() },
  handler: async (ctx, { serverSecret, since }) => {
    assertServer(serverSecret);
    return ctx.db
      .query("orders")
      .withIndex("by_creation_time", (q) => q.gte("_creationTime", since))
      .order("desc")
      .take(5000);
  },
});
