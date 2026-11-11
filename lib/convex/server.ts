import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Server-side Convex access. Order and settings functions require the shared
 * CONVEX_SERVER_SECRET, which never reaches the browser.
 */
export function convexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");
  return new ConvexHttpClient(url);
}

export function serverSecret(): string {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret) throw new Error("CONVEX_SERVER_SECRET is not set.");
  return secret;
}

export function isConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL && process.env.CONVEX_SERVER_SECRET);
}

export { api };
