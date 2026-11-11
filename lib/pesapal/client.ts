import "server-only";

import { z } from "zod";

/**
 * Minimal Pesapal API 3.0 client.
 * Docs: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference
 */

const BASE_URLS = {
  sandbox: "https://cybqa.pesapal.com/pesapalv3",
  live: "https://pay.pesapal.com/v3",
} as const;

export class PesapalError extends Error {}

function config() {
  const env = process.env.PESAPAL_ENV === "live" ? "live" : "sandbox";
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const ipnId = process.env.PESAPAL_IPN_ID;
  if (!consumerKey || !consumerSecret || !ipnId) {
    throw new PesapalError(
      "Pesapal is not configured (PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_IPN_ID).",
    );
  }
  return { baseUrl: BASE_URLS[env], consumerKey, consumerSecret, ipnId };
}

export function isPesapalConfigured(): boolean {
  return Boolean(
    process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET && process.env.PESAPAL_IPN_ID,
  );
}

const apiError = z
  .object({ code: z.string().nullish(), message: z.string().nullish() })
  .nullish();

const tokenResponse = z.object({
  token: z.string().nullish(),
  expiryDate: z.string().nullish(),
  error: apiError,
});

const submitOrderResponse = z.object({
  order_tracking_id: z.string().nullish(),
  redirect_url: z.string().nullish(),
  error: apiError,
});

const statusResponse = z.object({
  status_code: z.number().nullish(),
  payment_status_description: z.string().nullish(),
  payment_method: z.string().nullish(),
  confirmation_code: z.string().nullish(),
  merchant_reference: z.string().nullish(),
  amount: z.number().nullish(),
  currency: z.string().nullish(),
  error: apiError,
});

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  // Tokens last 5 minutes; refresh a minute early.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const { baseUrl, consumerKey, consumerSecret } = config();
  const data = await post(`${baseUrl}/api/Auth/RequestToken`, tokenResponse, {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  });
  if (!data.token) throw new PesapalError(data.error?.message ?? "Pesapal did not return a token.");
  const expiry = data.expiryDate ? Date.parse(data.expiryDate) : NaN;
  cachedToken = {
    token: data.token,
    expiresAt: Number.isFinite(expiry) ? expiry : Date.now() + 5 * 60_000,
  };
  return data.token;
}

async function post<T>(url: string, schema: z.ZodType<T>, body: unknown, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return parse(res, schema);
}

async function parse<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  const json: unknown = await res.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!res.ok || !parsed.success) {
    throw new PesapalError(`Pesapal request failed (HTTP ${res.status}).`);
  }
  return parsed.data;
}

export interface SubmitOrderInput {
  merchantReference: string;
  amount: string;
  currency: "USD";
  description: string;
  callbackUrl: string;
  billing: {
    email: string;
    phone: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

/**
 * Pesapal rejects billing fields that are empty, null, or contain anything
 * other than letters, digits, dashes, underscores, dots and colons (spaces,
 * commas and apostrophes included). Normalise to that alphabet and fall back
 * to "NA" so optional details never block a payment.
 */
function billingField(value: string | undefined): string {
  const cleaned = (value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._:-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return cleaned || "NA";
}

export async function submitOrderRequest(input: SubmitOrderInput) {
  const { baseUrl, ipnId } = config();
  const token = await getToken();
  const data = await post(
    `${baseUrl}/api/Transactions/SubmitOrderRequest`,
    submitOrderResponse,
    {
      id: input.merchantReference,
      currency: input.currency,
      amount: Number(input.amount),
      description: input.description.slice(0, 100),
      callback_url: input.callbackUrl,
      notification_id: ipnId,
      billing_address: {
        email_address: input.billing.email,
        phone_number: input.billing.phone,
        first_name: billingField(input.billing.firstName),
        middle_name: billingField(input.billing.middleName),
        last_name: billingField(input.billing.lastName),
        line_1: billingField(input.billing.line1),
        line_2: billingField(input.billing.line2),
        city: billingField(input.billing.city),
        state: billingField(input.billing.state),
        postal_code: billingField(input.billing.postalCode),
      },
    },
    token,
  );
  if (!data.order_tracking_id || !data.redirect_url) {
    throw new PesapalError(data.error?.message ?? "Pesapal did not accept the order.");
  }
  return { orderTrackingId: data.order_tracking_id, redirectUrl: data.redirect_url };
}

export type PaymentStatus = "pending" | "paid" | "failed" | "reversed";

/** status_code: 0 invalid/pending, 1 completed, 2 failed, 3 reversed. */
const STATUS_BY_CODE: Record<number, PaymentStatus> = { 1: "paid", 2: "failed", 3: "reversed" };

export async function getTransactionStatus(orderTrackingId: string) {
  const { baseUrl } = config();
  const token = await getToken();
  const url = `${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await parse(res, statusResponse);
  return {
    status: STATUS_BY_CODE[data.status_code ?? 0] ?? "pending",
    merchantReference: data.merchant_reference ?? null,
    paymentMethod: data.payment_method ?? undefined,
    description: data.payment_status_description ?? undefined,
    confirmationCode: data.confirmation_code ?? undefined,
    amount: data.amount ?? null,
    currency: data.currency ?? null,
  };
}
