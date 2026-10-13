import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/auth-form";
import { AuthHeading } from "@/components/account/auth-heading";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Join us"
        title="Create an account"
        description="Track orders and check out faster once online ordering opens."
      />
      <AuthForm mode="sign-up" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account/sign-in" className="font-semibold text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
