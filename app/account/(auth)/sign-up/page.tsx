import type { Metadata } from "next";
import { AuthForm } from "@/components/account/auth-form";
import { AuthSwitchLink } from "@/components/account/auth-switch-link";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Join us"
        title="Create an account"
        description="Track your orders in one place, including any you've already placed with the same email."
      />
      <AuthForm mode="sign-up" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <AuthSwitchLink href="/account/sign-in">Sign in</AuthSwitchLink>
      </p>
    </>
  );
}
