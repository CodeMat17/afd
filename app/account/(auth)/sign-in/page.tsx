import type { Metadata } from "next";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";
import { AuthSwitchLink } from "@/components/account/auth-switch-link";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <>
      <AuthHeading eyebrow="Welcome back" title="Sign in" description="Access your orders and saved details." />
      <AuthForm mode="sign-in" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <AuthSwitchLink href="/account/sign-up">Create an account</AuthSwitchLink>
      </p>
    </>
  );
}
