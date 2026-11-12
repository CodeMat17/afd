import type { GenericDocument, PaginationResult } from "convex/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";

/** Most accounts the admin list loads at once. */
const MAX_CUSTOMERS = 1000;
/** Orders read per customer when totting up their history. */
const MAX_ORDERS_PER_CUSTOMER = 200;

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
}

/**
 * Everyone who has created an account (newest first), with a summary of the
 * orders placed under their email. Admin only: called from the Next.js server.
 */
export const list = query({
  args: { serverSecret: v.string() },
  handler: async (ctx, { serverSecret }) => {
    assertServer(serverSecret);

    // Accounts live in the Better Auth component's own "user" table.
    const users: AuthUser[] = [];
    let cursor: string | null = null;
    while (users.length < MAX_CUSTOMERS) {
      const page: PaginationResult<GenericDocument> = await ctx.runQuery(components.betterAuth.adapter.findMany, {
        model: "user",
        sortBy: { field: "createdAt", direction: "desc" },
        paginationOpts: { cursor, numItems: Math.min(200, MAX_CUSTOMERS - users.length) },
      });
      users.push(...(page.page as unknown as AuthUser[]));
      if (page.isDone) break;
      cursor = page.continueCursor;
    }

    return Promise.all(
      users.map(async (user) => {
        const email = user.email.trim().toLowerCase();
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_email", (q) => q.eq("email", email))
          .order("desc")
          .take(MAX_ORDERS_PER_CUSTOMER);
        const paid = orders.filter((o) => o.status === "paid");
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          orderCount: orders.length,
          paidCount: paid.length,
          paidCents: paid.reduce((sum, o) => sum + BigInt(o.totalCents), BigInt(0)).toString(),
          lastOrderAt: orders[0]?._creationTime ?? null,
        };
      }),
    );
  },
});
