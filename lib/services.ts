/**
 * Integration boundaries for features that need a trusted backend.
 *
 * Every method currently resolves to `not-configured`. The UI renders that
 * honestly; nothing here pretends a request succeeded. Replace these with
 * Convex-backed implementations in the backend phase.
 */

export type ServiceResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; reason: "not-configured" | "invalid-credentials" | "error"; message: string };

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

export interface OrderService {
  submitOrder(): Promise<ServiceResult<{ orderNumber: string }>>;
}

export const authService: AuthService = {
  signIn: () => settle(notConfigured("Sign-in")),
  signUp: () => settle(notConfigured("Account creation")),
  requestPasswordReset: () => settle(notConfigured("Password reset")),
  resendVerification: () => settle(notConfigured("Email verification")),
};

export const contactService: ContactService = {
  sendMessage: () => settle(notConfigured("The contact form")),
};

export const orderService: OrderService = {
  submitOrder: () => settle(notConfigured("Order submission")),
};
