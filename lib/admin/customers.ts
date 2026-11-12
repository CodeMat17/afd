import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export type Customer = FunctionReturnType<typeof api.customers.list>[number];

export const CUSTOMER_FILTERS = ["all", "confirmed", "unconfirmed"] as const;
export type CustomerFilter = (typeof CUSTOMER_FILTERS)[number];

export function parseCustomerFilter(value: string | undefined): CustomerFilter {
  return CUSTOMER_FILTERS.includes(value as CustomerFilter) ? (value as CustomerFilter) : "all";
}

/** The customers matching a filter tab and a name/email search. */
export function filterCustomers(customers: Customer[], filter: CustomerFilter, q: string): Customer[] {
  const needle = q.trim().toLowerCase();
  return customers.filter(
    (c) =>
      (filter === "all" || c.emailVerified === (filter === "confirmed")) &&
      (!needle || [c.name, c.email].some((field) => field.toLowerCase().includes(needle))),
  );
}

/** Query string carrying the current filter and search, e.g. "?filter=confirmed&q=ann". */
export function customerQuery(filter: CustomerFilter, q: string, page = 1): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const str = params.toString();
  return str ? `?${str}` : "";
}
