import type { NextRequest } from "next/server";
import { filterCustomers, parseCustomerFilter, type Customer } from "@/lib/admin/customers";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";

/**
 * Customer list as a CSV download, honouring the same filter and search as
 * the Customers page (`?filter=` and `?q=`). Admin only.
 */
export async function GET(request: NextRequest) {
  await requireAdmin("/admin/customers");
  const params = request.nextUrl.searchParams;
  const customers = await convexClient().query(api.customers.list, { serverSecret: serverSecret() });
  const rows = filterCustomers(customers, parseCustomerFilter(params.get("filter") ?? undefined), params.get("q") ?? "");

  const header = ["Name", "Email", "Email confirmed", "Signed up", "Orders", "Paid orders", "Spent (USD)", "Last order"];
  const lines = [header, ...rows.map(toRow)].map((cells) => cells.map(csvCell).join(","));
  // The byte-order mark makes Excel open the file as UTF-8, so accented names survive.
  const body = `﻿${lines.join("\r\n")}\r\n`;

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function toRow(c: Customer): string[] {
  return [
    c.name,
    c.email,
    c.emailVerified ? "Yes" : "No",
    isoDate(c.createdAt),
    String(c.orderCount),
    String(c.paidCount),
    dollars(c.paidCents),
    c.lastOrderAt ? isoDate(c.lastOrderAt) : "",
  ];
}

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** "12345" cents → "123.45", kept as plain digits so spreadsheets can sum it. */
function dollars(cents: string): string {
  const value = BigInt(cents);
  const whole = value / BigInt(100);
  const rest = (value % BigInt(100)).toString().padStart(2, "0");
  return `${whole}.${rest}`;
}

function csvCell(value: string): string {
  // A cell starting with = + - @ would run as a formula in Excel or Sheets; a
  // leading apostrophe makes it plain text. Customers choose their own names.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
