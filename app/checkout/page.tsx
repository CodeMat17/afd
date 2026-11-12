import { User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCustomer } from "@/lib/auth-server";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container, PageHeader } from "@/components/ui/section";
import { getCheckoutSettings } from "@/lib/checkout/settings";
import { catalog } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader eyebrow="Secure checkout via Pesapal" title="Checkout" />
      <Container className="py-10 pb-24 lg:py-14">
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-2xl bg-muted" aria-busy="true" />}>
          <CheckoutLoader />
        </Suspense>
      </Container>
    </>
  );
}

async function CheckoutLoader() {
  const [products, settings, customer] = await Promise.all([
    catalog.getProducts(),
    getCheckoutSettings(),
    getCustomer().catch(() => null),
  ]);
  return (
    <>
      <AccountNotice customer={customer} />
      <CheckoutForm products={products} settings={settings} />
    </>
  );
}

/** Orders are filed under their email, so tell shoppers how they'll find this one later. */
function AccountNotice({ customer }: { customer: { name: string; email: string } | null }) {
  return (
    <p className="mb-8 flex items-start gap-3 rounded-2xl border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
      <User className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
      {customer ? (
        <span>
          Signed in as <span className="font-semibold text-foreground">{customer.email}</span>. Use this email
          below and the order will show up in your account.
        </span>
      ) : (
        <span>
          Checking out as a guest.{" "}
          <Link href="/account/sign-in?next=/checkout" className="font-semibold text-foreground underline underline-offset-4">
            Sign in
          </Link>{" "}
          to keep your orders in one place, or create an account later with the same email and this order
          will be there.
        </span>
      )}
    </p>
  );
}
