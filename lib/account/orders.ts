import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export type CustomerOrder = FunctionReturnType<typeof api.orders.mine>[number];

/** Status wording for shoppers (the admin dashboard has its own). */
export const CUSTOMER_STATUS: Record<
  CustomerOrder["status"],
  { label: string; note: string; tone: string }
> = {
  paid: {
    label: "Paid",
    note: "Payment received. We'll be in touch about pickup or delivery.",
    tone: "border-foreground/20 bg-foreground/5",
  },
  pending: {
    label: "Awaiting payment",
    note: "We haven't received payment for this order yet.",
    tone: "border-gold/40 bg-gold/10",
  },
  failed: {
    label: "Payment failed",
    note: "No payment was taken for this order.",
    tone: "border-destructive/30 bg-destructive/5",
  },
  reversed: {
    label: "Payment reversed",
    note: "This payment was reversed. Contact the showroom if you think this is a mistake.",
    tone: "border-destructive/30 bg-destructive/5",
  },
};

export const orderDate = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Nairobi",
});
