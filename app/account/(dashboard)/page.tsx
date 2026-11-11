import { Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/account/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { requireCustomer } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const customer = await requireCustomer();
  const firstName = customer.name.split(" ")[0] || customer.name;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-surface p-6 sm:p-8">
        <h2 className="font-heading text-4xl">Welcome, {firstName}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as <span className="font-semibold text-foreground">{customer.email}</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/shop" className={buttonVariants()}>
            Continue shopping
          </Link>
          <SignOutButton />
        </div>
      </div>

      <Link href="/account/orders" className="flex items-center gap-4 rounded-2xl border p-5 transition-colors hover:bg-muted">
        <Package className="size-5 text-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold">Orders</p>
          <p className="text-sm text-muted-foreground">Track your orders and view their details.</p>
        </div>
      </Link>
    </div>
  );
}
