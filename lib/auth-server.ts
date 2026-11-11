import "server-only";

import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api } from "@/convex/_generated/api";

export const { handler, fetchAuthQuery, fetchAuthMutation, isAuthenticated } =
  convexBetterAuthNextJs({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
  });

/** The signed-in customer, or null. Reads cookies, so call it inside <Suspense>. */
export const getCustomer = cache(() => fetchAuthQuery(api.auth.getCurrentUser));

/** Like getCustomer, but sends signed-out visitors to the sign-in page. */
export async function requireCustomer() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/sign-in");
  return customer;
}
