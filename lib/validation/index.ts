/**
 * Validation schemas shared by client forms and (later) server mutations.
 * The server must re-validate every payload; client checks are UX only.
 */
import { z } from "zod";

const phonePattern = /^\+?[0-9\s().-]{7,20}$/;

const requiredText = (label: string, min = 2, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `${label} looks too short.`)
    .max(max, `${label} is too long.`);

const optionalText = (max = 120) => z.string().trim().max(max).optional().or(z.literal(""));

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

export const checkoutSchema = z
  .object({
    fullName: requiredText("Full name"),
    email,
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required.")
      .regex(phonePattern, "Enter a valid phone number, including country code."),
    addressLine1: requiredText("Address", 3, 160),
    addressLine2: optionalText(160),
    city: requiredText("City"),
    region: optionalText(),
    postalCode: optionalText(20),
    country: requiredText("Country"),
    notes: optionalText(1000),
    readyToPayApplicableTaxes: z.boolean(),
    taxId: z.string().trim().max(40, "Tax ID is too long.").optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      !data.readyToPayApplicableTaxes ||
      (typeof data.taxId === "string" && /^[A-Za-z0-9\-/ ]{4,40}$/.test(data.taxId)),
    {
      path: ["taxId"],
      message: "Enter your Tax ID (letters, numbers, dashes; at least 4 characters).",
    },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: requiredText("Name"),
  email,
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  subject: requiredText("Subject", 3, 140),
  message: requiredText("Message", 10, 2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

const password = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Use at least 8 characters.")
  .max(128, "Password is too long.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    fullName: requiredText("Full name"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({ email });

export type FieldErrors = Record<string, string>;

/** First error message per field, keyed by top-level field name. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}

/** Read a FormData object into plain strings/booleans for validation. */
export function formDataToObject(
  formData: FormData,
  booleanFields: string[] = [],
): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") result[key] = value;
  });
  for (const field of booleanFields) {
    result[field] = formData.get(field) === "on";
  }
  return result;
}
