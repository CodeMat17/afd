"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField, focusFirstInvalid } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { authService, type ServiceResult } from "@/lib/services";
import {
  forgotPasswordSchema,
  formDataToObject,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "verify-email" | "reset-password";

const copy: Record<Mode, { submit: string; pending: string }> = {
  "sign-in": { submit: "Sign in", pending: "Signing in…" },
  "sign-up": { submit: "Create account", pending: "Creating account…" },
  "forgot-password": { submit: "Send reset link", pending: "Sending…" },
  "verify-email": { submit: "Resend verification email", pending: "Sending…" },
  "reset-password": { submit: "Save new password", pending: "Saving…" },
};

/** What to tell the shopper once a request succeeds (sign-in redirects instead). */
const success: Record<Exclude<Mode, "sign-in">, { title: string; body: string }> = {
  "sign-up": {
    title: "Check your email",
    body: "We've sent you a link to confirm your address. Open it to finish creating your account.",
  },
  "forgot-password": {
    title: "Check your email",
    body: "If an account exists for that email, a reset link is on its way. It expires in one hour.",
  },
  "verify-email": {
    title: "Link sent",
    body: "If that email has an account waiting to be confirmed, a new link is on its way.",
  },
  "reset-password": {
    title: "Password updated",
    body: "Your new password is saved. You can sign in with it now.",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ServiceResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = formDataToObject(new FormData(form));
    setResult(null);

    let outcome: ServiceResult;
    if (mode === "sign-in") {
      const parsed = signInSchema.safeParse(values);
      if (!parsed.success) return fail(form, toFieldErrors(parsed.error));
      setErrors({});
      setPending(true);
      outcome = await authService.signIn(parsed.data);
      if (outcome.ok) {
        // Refresh so server-rendered parts of the page see the new session.
        router.replace("/account");
        router.refresh();
        return;
      }
    } else if (mode === "sign-up") {
      const parsed = signUpSchema.safeParse(values);
      if (!parsed.success) return fail(form, toFieldErrors(parsed.error));
      setErrors({});
      setPending(true);
      outcome = await authService.signUp(parsed.data);
    } else if (mode === "reset-password") {
      const parsed = resetPasswordSchema.safeParse(values);
      if (!parsed.success) return fail(form, toFieldErrors(parsed.error));
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setResult({
          ok: false,
          reason: "error",
          message: "This reset link is invalid or has expired. Request a new one.",
        });
        return;
      }
      setErrors({});
      setPending(true);
      outcome = await authService.resetPassword({ token, password: parsed.data.password });
    } else {
      const parsed = forgotPasswordSchema.safeParse(values);
      if (!parsed.success) return fail(form, toFieldErrors(parsed.error));
      setErrors({});
      setPending(true);
      outcome =
        mode === "forgot-password"
          ? await authService.requestPasswordReset(parsed.data)
          : await authService.resendVerification(parsed.data);
    }
    setPending(false);
    setResult(outcome);
    if (outcome.ok) form.reset();
  };

  const fail = (form: HTMLFormElement, next: FieldErrors) => {
    setErrors(next);
    window.setTimeout(() => focusFirstInvalid(form), 0);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      aria-pressed={showPassword}
    >
      {showPassword ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
      {showPassword ? "Hide password" : "Show password"}
    </button>
  );

  const asksForPassword = mode === "sign-in" || mode === "sign-up" || mode === "reset-password";
  const asksToConfirm = mode === "sign-up" || mode === "reset-password";

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {mode === "sign-up" ? (
        <TextField id="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
      ) : null}
      {mode !== "reset-password" ? (
        <TextField id="email" type="email" label="Email" autoComplete="email" error={errors.email} />
      ) : null}

      {asksForPassword ? (
        <div className="space-y-2">
          <TextField
            id="password"
            type={showPassword ? "text" : "password"}
            label={mode === "reset-password" ? "New password" : "Password"}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            hint={mode === "sign-in" ? undefined : "At least 8 characters."}
            error={errors.password}
          />
          <div className="flex items-center justify-between">
            {passwordToggle}
            {mode === "sign-in" ? (
              <Link href="/account/forgot-password" className="inline-flex min-h-8 items-center text-xs font-semibold underline underline-offset-4">
                Forgot password?
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {asksToConfirm ? (
        <TextField
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          label={mode === "reset-password" ? "Confirm new password" : "Confirm password"}
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
      ) : null}

      {result && !result.ok ? (
        <FormAlert
          tone={result.reason === "not-configured" || result.reason === "unverified" ? "info" : "error"}
          title={
            result.reason === "invalid-credentials"
              ? "Email or password is incorrect"
              : result.reason === "unverified"
                ? "Confirm your email"
                : result.reason === "not-configured"
                  ? "Not available yet"
                  : "That didn't work"
          }
        >
          {result.message}
        </FormAlert>
      ) : null}

      {result?.ok && mode !== "sign-in" ? (
        <FormAlert title={success[mode].title}>
          {success[mode].body}
          {mode === "reset-password" ? (
            <>
              {" "}
              <Link href="/account/sign-in" className="font-semibold text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </>
          ) : null}
        </FormAlert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? copy[mode].pending : copy[mode].submit}
      </Button>
    </form>
  );
}
