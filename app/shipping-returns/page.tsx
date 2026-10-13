import type { Metadata } from "next";
import { DraftDocument } from "@/components/ui/draft-document";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "How shipping and returns will work at African Fabric and Designs.",
};

export default function ShippingReturnsPage() {
  return (
    <DraftDocument
      eyebrow="Customer care"
      title="Shipping & Returns"
      intro="Shipping methods, costs, delivery regions and the returns process will be published here once confirmed by the business."
      reviewer="business"
      sections={[
        { title: "Delivery regions", covers: "Which countries and cities can be delivered to, and any exclusions." },
        { title: "Shipping costs", covers: "How shipping is calculated and when the customer sees the final cost." },
        { title: "Dispatch & delivery times", covers: "Processing and courier timeframes, only once they can be guaranteed." },
        { title: "Showroom collection", covers: "Whether orders can be collected from Marcus Garvey Rd, Nairobi." },
        { title: "Returns & exchanges", covers: "Eligibility for returns on cut fabric, condition requirements and timeframes." },
        { title: "Damaged or incorrect items", covers: "How to report a problem and what remedy applies." },
        { title: "Customs, duties & taxes", covers: "Who is responsible for import duties and taxes on international orders." },
      ]}
    />
  );
}
