import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Account recovery"
        title="Reset your password"
        description="Enter the email you signed up with and we'll send a reset link."
      />
      <AuthForm mode="forgot-password" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/account/sign-in" className="font-semibold text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
