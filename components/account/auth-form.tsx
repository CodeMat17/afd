"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField, focusFirstInvalid } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { authService, type ServiceResult } from "@/lib/services";
import {
  forgotPasswordSchema,
  formDataToObject,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "verify-email";

const copy: Record<Mode, { submit: string; pending: string }> = {
  "sign-in": { submit: "Sign in", pending: "Signing in…" },
  "sign-up": { submit: "Create account", pending: "Creating account…" },
  "forgot-password": { submit: "Send reset link", pending: "Sending…" },
  "verify-email": { submit: "Resend verification email", pending: "Sending…" },
};

export function AuthForm({ mode }: { mode: Mode }) {
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
    } else if (mode === "sign-up") {
      const parsed = signUpSchema.safeParse(values);
      if (!parsed.success) return fail(form, toFieldErrors(parsed.error));
      setErrors({});
      setPending(true);
      outcome = await authService.signUp(parsed.data);
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

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {mode === "sign-up" ? (
        <TextField id="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
      ) : null}
      <TextField id="email" type="email" label="Email" autoComplete="email" error={errors.email} />

      {mode === "sign-in" || mode === "sign-up" ? (
        <div className="space-y-2">
          <TextField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            hint={mode === "sign-up" ? "At least 8 characters." : undefined}
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

      {mode === "sign-up" ? (
        <TextField
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
      ) : null}

      {result && !result.ok ? (
        <FormAlert
          tone={result.reason === "not-configured" ? "info" : "error"}
          title={result.reason === "invalid-credentials" ? "Email or password is incorrect" : "Accounts are coming soon"}
        >
          {result.message}
        </FormAlert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? copy[mode].pending : copy[mode].submit}
      </Button>
    </form>
  );
}
