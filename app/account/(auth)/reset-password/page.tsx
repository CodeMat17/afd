import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** Where the link in the password-reset email lands (with ?token=…). */
export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Account recovery"
        title="Choose a new password"
        description="Enter a new password for your account. You'll be signed out on other devices."
      />
      <AuthForm mode="reset-password" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Link expired?{" "}
        <Link href="/account/forgot-password" className="font-semibold text-foreground underline underline-offset-4">
          Request a new one
        </Link>
      </p>
    </>
  );
}
