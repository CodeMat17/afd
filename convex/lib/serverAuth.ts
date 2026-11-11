import { ConvexError } from "convex/values";

/**
 * Functions that read customer data or change prices may only be called by
 * the Next.js server, which holds the same CONVEX_SERVER_SECRET.
 */
export function assertServer(secret: string): void {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || !constantTimeEqual(secret, expected)) {
    throw new ConvexError("Unauthorized");
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
