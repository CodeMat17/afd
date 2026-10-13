import { MapPin, Package, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PreviewNotice } from "@/components/ui/section";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

const features = [
  { icon: Package, title: "Orders", body: "Track every order and view its details." },
  { icon: MapPin, title: "Addresses", body: "Save delivery addresses for faster checkout." },
  { icon: User, title: "Profile", body: "Manage your name, email and password." },
];

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-md border bg-surface p-6 sm:p-8">
        <h2 className="font-heading text-4xl">You&apos;re not signed in</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Sign in to see your orders and saved details. Your cart is kept on this device either way.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/account/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
          <Link href="/account/sign-up" className={buttonVariants({ variant: "outline" })}>
            Create an account
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold tracking-[0.12em] uppercase">What your account will include</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-md border p-5">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-4 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>

      <PreviewNotice title="Accounts are in preview">
        Customer accounts will be connected to a secure authentication service in the next phase.
      </PreviewNotice>
    </div>
  );
}
