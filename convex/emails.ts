import { v } from "convex/values";
import { formatCents } from "../lib/money";
import { site } from "../lib/site";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { emailButton, emailLayout, escapeHtml, sendEmail } from "./lib/email";

/**
 * "Order confirmed" email, sent once when an order is first marked paid
 * (scheduled from orders.recordPayment).
 */
export const sendOrderConfirmation = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const data = await ctx.runQuery(internal.emails.orderForEmail, { orderId });
    if (!data || data.order.status !== "paid" || data.order.confirmationEmailedAt) return;

    const { order, replyTo } = data;
    const siteUrl = process.env.SITE_URL ?? site.url;
    const orderUrl = `${siteUrl}/checkout/confirmation/${encodeURIComponent(order.orderNumber)}`;
    const signUpUrl = `${siteUrl}/account/sign-up?email=${encodeURIComponent(order.email)}`;

    await sendEmail({
      to: order.email,
      subject: `Order ${order.orderNumber} confirmed`,
      html: orderHtml(order, orderUrl, signUpUrl),
      text: orderText(order, orderUrl, signUpUrl),
      replyTo,
      logNote: `Order ${order.orderNumber} would have been confirmed by email.`,
    });
    await ctx.runMutation(internal.emails.markConfirmationEmailed, { orderId });
  },
});

export const orderForEmail = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;
    const contact = await ctx.db
      .query("contact")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    return { order, replyTo: contact?.email || undefined };
  },
});

export const markConfirmationEmailed = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    await ctx.db.patch(orderId, { confirmationEmailedAt: Date.now() });
  },
});

const money = (cents: string) => formatCents(BigInt(cents));
const quantity = (item: Doc<"orders">["items"][number]) =>
  `${item.quantity} ${item.quantity === "1" ? item.unit : `${item.unit}s`}`;

function fulfilmentLine(order: Doc<"orders">): string {
  if (order.fulfilment === "pickup") {
    return `Pickup at our showroom: ${site.address.street}, ${site.address.city}. We'll contact you when it's ready.`;
  }
  const a = order.address;
  const where = a ? [a.line1, a.line2, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(", ") : "";
  return `Delivery to ${where}. We'll contact you about delivery.`;
}

function totals(order: Doc<"orders">): [string, string][] {
  return [
    ["Subtotal", money(order.subtotalCents)],
    [order.fulfilment === "pickup" ? "Showroom pickup" : "Shipping", order.fulfilment === "pickup" ? "Free" : money(order.shippingCents)],
    ...(order.taxDeclared ? ([["Tax", money(order.taxCents)]] as [string, string][]) : []),
  ];
}

function orderHtml(order: Doc<"orders">, orderUrl: string, signUpUrl: string): string {
  const cell = "padding:10px 0;border-bottom:1px solid #e7e5e4;font-size:14px;vertical-align:top";
  const items = order.items
    .map(
      (item) => `<tr>
        <td style="${cell}"><strong>${escapeHtml(item.name)}</strong><br><span style="color:#78716c;font-size:12px">${escapeHtml(quantity(item))}</span></td>
        <td style="${cell};text-align:right;white-space:nowrap">${money(item.lineTotalCents)}</td>
      </tr>`,
    )
    .join("");
  const sums = totals(order)
    .map(
      ([label, value]) => `<tr>
        <td style="padding:4px 0;font-size:14px;color:#78716c">${label}</td>
        <td style="padding:4px 0;font-size:14px;text-align:right">${value}</td>
      </tr>`,
    )
    .join("");

  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:24px">Thank you, ${escapeHtml(order.fullName.split(" ")[0] || order.fullName)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6">We've received your payment. Your order <strong>${escapeHtml(order.orderNumber)}</strong> is confirmed.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${items}</table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:12px">
      ${sums}
      <tr>
        <td style="padding:10px 0 0;font-size:16px;font-weight:bold;border-top:1px solid #e7e5e4">Total paid</td>
        <td style="padding:10px 0 0;font-size:16px;font-weight:bold;text-align:right;border-top:1px solid #e7e5e4">${money(order.totalCents)}</td>
      </tr>
    </table>
    <p style="margin:24px 0;font-size:14px;line-height:1.6">${escapeHtml(fulfilmentLine(order))}</p>
    ${emailButton("View your order", orderUrl)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6">Want to track this and future orders in one place? <a href="${escapeHtml(signUpUrl)}" style="color:inherit;font-weight:bold">Create an account</a> with ${escapeHtml(order.email)}. Any orders you've already placed with that email will be there too. Already have an account? Just sign in.</p>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#78716c">Questions about your order? Just reply to this email.</p>`);
}

function orderText(order: Doc<"orders">, orderUrl: string, signUpUrl: string): string {
  return [
    `Thank you, ${order.fullName}.`,
    `We've received your payment. Your order ${order.orderNumber} is confirmed.`,
    "",
    ...order.items.map((item) => `- ${item.name} (${quantity(item)}): ${money(item.lineTotalCents)}`),
    "",
    ...totals(order).map(([label, value]) => `${label}: ${value}`),
    `Total paid: ${money(order.totalCents)}`,
    "",
    fulfilmentLine(order),
    "",
    `View your order: ${orderUrl}`,
    "",
    `Track this and future orders in one place: create an account with ${order.email} at ${signUpUrl}`,
  ].join("\n");
}
