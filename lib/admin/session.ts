import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

/**
 * Admin guard: a shared ADMIN_PASSWORD and a signed, httpOnly session
 * cookie. Failed sign-ins are limited in convex/loginAttempts.ts.
 */
const COOKIE = "afd_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set (at least 32 characters).");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so the comparison is constant-time regardless of length.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${expected}`));
}

/**
 * The visitor's IP as a keyed hash, so the attempt counter never stores raw
 * IPs. Netlify's own header can't be set by the client; the others are
 * fallbacks for other hosts and local development.
 */
export async function clientIpKey(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-nf-client-connection-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return sign(`ip:${ip}`).slice(0, 32);
}

export async function createAdminSession(): Promise<void> {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  // Expiry is checked against the request time; connection() keeps the clock
  // read out of any prerender (cookies can be present in runtime prefetches).
  await connection();
  return Number(expires) > Date.now();
}

/** Where admins land after signing in, unless they were on their way somewhere. */
export const ADMIN_HOME = "/admin";

/**
 * `next` from the login URL, accepted only when it's a dashboard page on
 * this site, so a crafted link can't bounce the admin somewhere else.
 */
export function safeAdminPath(next: unknown): string {
  if (typeof next !== "string" || next.length > 500) return ADMIN_HOME;
  if (!/^\/admin\/[A-Za-z0-9\-_/]*(\?[A-Za-z0-9\-_=&%]*)?$/.test(next)) return ADMIN_HOME;
  if (next.includes("//") || next.startsWith("/admin/login")) return ADMIN_HOME;
  return next;
}

export function loginUrl(returnTo?: string): string {
  const next = safeAdminPath(returnTo);
  return next === ADMIN_HOME ? "/admin/login" : `/admin/login?next=${encodeURIComponent(next)}`;
}

/**
 * Use at the top of every admin page and action. Pages pass their own path
 * so the admin returns there after signing in; actions omit it and the page
 * the form was submitted from is used.
 */
export async function requireAdmin(returnTo?: string): Promise<void> {
  if (await isAdmin()) return;
  let path = returnTo;
  if (path === undefined) {
    const referer = (await headers()).get("referer");
    try {
      if (referer) path = new URL(referer).pathname;
    } catch {
      // Malformed header: fall back to the default page.
    }
  }
  redirect(loginUrl(path));
}
