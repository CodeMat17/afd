import { v } from "convex/values";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { assertServer } from "./lib/serverAuth";

/**
 * Limits on admin password guesses. Netlify functions don't share memory,
 * so the counters live here.
 *
 * - Per IP: 5 failed tries per 15 minutes.
 * - Overall: 30 failed tries per hour from all IPs together, which stops
 *   guessing spread across many IPs. The trade-off is that an attacker can
 *   lock the owner out for up to an hour; the lock lifts by itself, or
 *   clear it with `npx convex run loginAttempts:reset`.
 */
const MINUTE = 60_000;
const LIMITS = {
  ip: { max: 5, windowMs: 15 * MINUTE },
  global: { max: 30, windowMs: 60 * MINUTE },
} as const;

type Limit = (typeof LIMITS)[keyof typeof LIMITS];

async function counter(ctx: MutationCtx, key: string, limit: Limit, now: number) {
  const row = await ctx.db
    .query("loginAttempts")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  const active = row && now - row.windowStart < limit.windowMs;
  return {
    row,
    count: active ? row.count : 0,
    windowStart: active ? row.windowStart : now,
  };
}

/**
 * Called before the password is checked. Counts the try up front, so
 * parallel guesses can't slip past the limit, and refuses once a limit is
 * reached. A successful sign-in then calls `succeeded` to clear its IP.
 */
export const begin = mutation({
  args: { serverSecret: v.string(), ipKey: v.string() },
  handler: async (ctx, { serverSecret, ipKey }) => {
    assertServer(serverSecret);
    const now = Date.now();
    const counters = [
      { key: `ip:${ipKey}`, limit: LIMITS.ip },
      { key: "global", limit: LIMITS.global },
    ];
    const states = await Promise.all(counters.map((c) => counter(ctx, c.key, c.limit, now)));

    const blocked = states
      .map((s, i) => ({ ...s, limit: counters[i].limit }))
      .filter((s) => s.count >= s.limit.max);
    if (blocked.length > 0) {
      const retryAfterMs = Math.max(...blocked.map((s) => s.windowStart + s.limit.windowMs - now));
      return { allowed: false as const, retryAfterMs };
    }

    for (const [i, s] of states.entries()) {
      const values = { count: s.count + 1, windowStart: s.windowStart };
      if (s.row) await ctx.db.patch(s.row._id, values);
      else await ctx.db.insert("loginAttempts", { key: counters[i].key, ...values });
    }
    return { allowed: true as const };
  },
});

/** A correct password clears that IP's count (not the global one). */
export const succeeded = mutation({
  args: { serverSecret: v.string(), ipKey: v.string() },
  handler: async (ctx, { serverSecret, ipKey }) => {
    assertServer(serverSecret);
    const row = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", `ip:${ipKey}`))
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});

/** Clear every lock: `npx convex run loginAttempts:reset` (add `--prod` for production). */
export const reset = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const row of await ctx.db.query("loginAttempts").collect()) await ctx.db.delete(row._id);
  },
});
