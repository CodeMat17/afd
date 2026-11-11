/**
 * Integration boundaries for features that need a trusted backend.
 *
 * Customer accounts are live (Better Auth on Convex: see convex/auth.ts).
 * The contact form still resolves to `not-configured`; the UI renders that
 * honestly. (Checkout is live: see app/checkout/actions.ts.)
 */

import { authClient } from "@/lib/auth-client";

export type ServiceResult<T = null> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "not-configured" | "invalid-credentials" | "unverified" | "error";
      message: string;
    };

const notConfigured = (feature: string): ServiceResult<never> => ({
  ok: false,
  reason: "not-configured",
  message: `${feature} isn't connected yet. This storefront is a preview, so nothing was sent or saved.`,
});

const settle = <T>(result: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(result), 450));

export interface AuthService {
  signIn(input: { email: string; password: string }): Promise<ServiceResult>;
  signUp(input: { fullName: string; email: string; password: string }): Promise<ServiceResult>;
  requestPasswordReset(input: { email: string }): Promise<ServiceResult>;
  resendVerification(input: { email: string }): Promise<ServiceResult>;
  resetPassword(input: { token: string; password: string }): Promise<ServiceResult>;
}

export interface ContactService {
  sendMessage(input: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<ServiceResult>;
}

type AuthError = { code?: string; status?: number; message?: string } | null;

/** Turns a Better Auth error into a message a shopper can act on. */
function authFailure(error: NonNullable<AuthError>): ServiceResult {
  if (error.status === 429) {
    return { ok: false, reason: "error", message: "Too many attempts. Please wait a minute and try again." };
  }
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return { ok: false, reason: "invalid-credentials", message: "Check your details and try again." };
    case "EMAIL_NOT_VERIFIED":
      return {
        ok: false,
        reason: "unverified",
        message: "Please confirm your email first. We've sent you a new confirmation link.",
      };
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return { ok: false, reason: "error", message: "An account with this email already exists. Try signing in." };
    case "INVALID_TOKEN":
      return { ok: false, reason: "error", message: "This reset link is invalid or has expired. Request a new one." };
    default:
      return { ok: false, reason: "error", message: "Something went wrong. Please try again." };
  }
}

async function settleAuth(request: Promise<{ error: AuthError }>): Promise<ServiceResult> {
  try {
    const { error } = await request;
    return error ? authFailure(error) : { ok: true, data: null };
  } catch {
    return {
      ok: false,
      reason: "error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const authService: AuthService = {
  signIn: ({ email, password }) => settleAuth(authClient.signIn.email({ email, password })),
  signUp: ({ fullName, email, password }) =>
    settleAuth(authClient.signUp.email({ name: fullName, email, password, callbackURL: "/account" })),
  requestPasswordReset: ({ email }) =>
    settleAuth(authClient.requestPasswordReset({ email, redirectTo: "/account/reset-password" })),
  resendVerification: ({ email }) =>
    settleAuth(authClient.sendVerificationEmail({ email, callbackURL: "/account" })),
  resetPassword: ({ token, password }) =>
    settleAuth(authClient.resetPassword({ token, newPassword: password })),
};

export const contactService: ContactService = {
  sendMessage: () => settle(notConfigured("The contact form")),
};
