import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <>
      <AuthHeading
        eyebrow="One more step"
        title="Verify your email"
        description="After signing up, you'll receive a link to confirm your address. Didn't get it? Request another below."
      />
      <AuthForm mode="verify-email" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/account/sign-in" className="font-semibold text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
