import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container, PageHeader } from "@/components/ui/section";
import { catalog } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const products = await catalog.getProducts();
  return (
    <>
      <PageHeader eyebrow="Secure checkout — coming soon" title="Checkout" />
      <Container className="py-10 pb-24 lg:py-14">
        <CheckoutForm products={products} />
      </Container>
    </>
  );
}
