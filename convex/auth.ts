import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { sendAccountEmail } from "./lib/email";

/**
 * Customer accounts: email + password, with a verified email address
 * required before signing in. (The admin dashboard has its own separate
 * password; see lib/admin/session.ts.)
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    // The storefront's address, e.g. http://localhost:3000 or the live domain.
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAccountEmail({
          to: user.email,
          subject: "Reset your password",
          heading: "Reset your password",
          body: "We received a request to reset the password for your account. This link expires in one hour.",
          buttonLabel: "Choose a new password",
          url,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAccountEmail({
          to: user.email,
          subject: "Confirm your email",
          heading: "Confirm your email",
          body: "Thanks for creating an account. Confirm your email address to finish setting it up.",
          buttonLabel: "Confirm email",
          url,
        });
      },
    },
    // Slows down password guessing. Stored in Convex so limits hold across requests.
    rateLimit: { enabled: true, storage: "database" },
    plugins: [convex({ authConfig })],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

/** The signed-in customer's name and email, or null when signed out. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    return { name: user.name, email: user.email };
  },
});
