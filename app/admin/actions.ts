"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  clientIpKey,
  createAdminSession,
  destroyAdminSession,
  isAdminConfigured,
  requireAdmin,
  safeAdminPath,
} from "@/lib/admin/session";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { toCents } from "@/lib/money";

export type FormState = { ok: boolean; message: string } | null;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAdminConfigured()) {
    return { ok: false, message: "Admin access isn't configured (ADMIN_PASSWORD, ADMIN_SESSION_SECRET)." };
  }
  const password = formData.get("password");
  if (typeof password !== "string" || password === "") {
    return { ok: false, message: "Enter the admin password." };
  }

  // Count the try before checking the password. If the counter can't be
  // reached, refuse rather than allow unlimited guesses.
  const ipKey = await clientIpKey();
  let attempt: { allowed: true } | { allowed: false; retryAfterMs: number };
  try {
    attempt = await convexClient().mutation(api.loginAttempts.begin, { serverSecret: serverSecret(), ipKey });
  } catch (error) {
    console.error("[admin] sign-in limiter unavailable", error);
    return { ok: false, message: "Sign-in is unavailable right now. Please try again shortly." };
  }
  if (!attempt.allowed) {
    const minutes = Math.max(1, Math.ceil(attempt.retryAfterMs / 60_000));
    return {
      ok: false,
      message: `Too many failed sign-ins. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  if (!checkPassword(password)) {
    return { ok: false, message: "Incorrect password." };
  }

  try {
    await convexClient().mutation(api.loginAttempts.succeeded, { serverSecret: serverSecret(), ipKey });
  } catch (error) {
    // Not fatal: the count expires on its own.
    console.error("[admin] couldn't clear sign-in attempts", error);
  }
  await createAdminSession();
  redirect(safeAdminPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const taxRate = String(formData.get("taxRate") ?? "").trim();
  const shippingFee = String(formData.get("shippingFee") ?? "").trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(taxRate) || Number(taxRate) > 100) {
    return { ok: false, message: "Tax rate must be a percentage between 0 and 100 (up to 2 decimals)." };
  }
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(shippingFee)) {
    return { ok: false, message: "Shipping fee must be a USD amount such as 15 or 15.50." };
  }

  try {
    await convexClient().mutation(api.settings.update, {
      serverSecret: serverSecret(),
      // "16.5" → 1650 basis points, without float arithmetic.
      taxRateBps: Number(toCents(taxRate)),
      shippingFeeCents: toCents(shippingFee).toString(),
    });
  } catch (error) {
    console.error("[admin] failed to save settings", error);
    return { ok: false, message: "Couldn't save settings. Please try again." };
  }
  return { ok: true, message: "Settings saved. Checkout uses the new values immediately." };
}
