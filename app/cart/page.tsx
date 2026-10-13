import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Container, PageHeader } from "@/components/ui/section";
import { catalog } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false },
};

export default async function CartPage() {
  const products = await catalog.getProducts();
  return (
    <>
      <PageHeader eyebrow="Your selection" title="Cart" />
      <Container className="py-10 pb-24 lg:py-14">
        <CartView products={products} />
      </Container>
    </>
  );
}
