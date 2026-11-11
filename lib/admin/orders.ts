import { connection } from "next/server";
import type { Doc } from "@/convex/_generated/dataModel";

export type Order = Doc<"orders">;
export type OrderStatus = Order["status"];
export type Tone = "good" | "warn" | "bad" | "neutral";

/** Plain-language status wording, so staff never have to decode a payment state. */
export const STATUS_META: Record<OrderStatus, { label: string; tone: Tone; next: string }> = {
  paid: {
    label: "Paid",
    tone: "good",
    next: "Payment received. Pack the order and get it to the customer.",
  },
  pending: {
    label: "Awaiting payment",
    tone: "warn",
    next: "The customer started checkout but hasn't paid yet. Don't send anything yet.",
  },
  failed: {
    label: "Payment failed",
    tone: "bad",
    next: "The payment didn't go through. Nothing to send; the customer may try again.",
  },
  reversed: {
    label: "Reversed",
    tone: "bad",
    next: "The payment was reversed and the pieces went back into stock. Don't send this order.",
  },
};

export const STATUS_ORDER: OrderStatus[] = ["paid", "pending", "failed", "reversed"];

/** The showroom is in Nairobi (UTC+3, no daylight saving). */
const TIME_ZONE = "Africa/Nairobi";
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days since the epoch, counted in Nairobi time. */
export function nairobiDay(ms: number): number {
  return Math.floor((ms + NAIROBI_OFFSET_MS) / DAY_MS);
}

/** Start of a Nairobi day, as a UTC timestamp. */
export function nairobiDayStart(day: number): number {
  return day * DAY_MS - NAIROBI_OFFSET_MS;
}

export function nairobiHour(ms: number): number {
  return new Date(ms + NAIROBI_OFFSET_MS).getUTCHours();
}

export const dateTime = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export const longDate = new Intl.DateTimeFormat("en-KE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

export const shortDay = new Intl.DateTimeFormat("en-KE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});

export const dayMonth = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});

/** "3 min ago", "Yesterday", "4 Nov" — friendlier than a timestamp in lists. */
export function relativeTime(ms: number, now: number): string {
  const diff = Math.max(0, now - ms);
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  const days = nairobiDay(now) - nairobiDay(ms);
  if (days === 0) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return dayMonth.format(ms);
}

export function fulfilmentLabel(o: Pick<Order, "fulfilment" | "address">): string {
  if (o.fulfilment === "pickup") return "Showroom pickup";
  return o.address ? `Delivery to ${o.address.city}, ${o.address.country}` : "Delivery";
}

/**
 * A wa.me link for the customer's phone. Numbers typed in local form
 * ("0712…") are assumed to be Kenyan, the store's home market.
 */
export function customerWhatsappUrl(phone: string, message: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  if (digits.length < 9) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/**
 * The current time for a server-rendered admin page. `connection()` marks
 * the read as request-time, so it is never frozen into a prerender (cookies
 * alone are not enough: runtime prefetches render with cookies available).
 */
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}
