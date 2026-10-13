import type { Metadata } from "next";
import { DraftDocument } from "@/components/ui/draft-document";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <DraftDocument
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="The terms that will govern purchases from African Fabric and Designs. Approved wording will replace this outline."
      reviewer="legal"
      sections={[
        { title: "About these terms", covers: "Who the terms apply to and the contracting entity." },
        { title: "Products & colours", covers: "How product photos, colours and measurements should be interpreted." },
        { title: "Pricing & currency", covers: "Prices are displayed in USD; how taxes, duties and shipping are applied." },
        { title: "Orders & acceptance", covers: "When an order becomes a binding contract." },
        { title: "Payment", covers: "Accepted payment methods, once a payment provider is integrated." },
        { title: "Delivery & risk", covers: "When ownership and risk pass to the customer." },
        { title: "Returns", covers: "Cross-reference to the approved Shipping & Returns policy." },
        { title: "Liability & governing law", covers: "Limitations of liability and the governing jurisdiction." },
      ]}
    />
  );
}
