import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <>
      <AuthHeading eyebrow="Welcome back" title="Sign in" description="Access your orders and saved details." />
      <AuthForm mode="sign-in" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/account/sign-up" className="font-semibold text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}
