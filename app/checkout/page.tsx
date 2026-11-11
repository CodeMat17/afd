import type { Metadata } from "next";
import { Suspense } from "react";
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
  const [products, settings] = await Promise.all([catalog.getProducts(), getCheckoutSettings()]);
  return <CheckoutForm products={products} settings={settings} />;
}
