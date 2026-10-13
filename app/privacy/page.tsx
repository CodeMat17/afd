import type { Metadata } from "next";
import { DraftDocument } from "@/components/ui/draft-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <DraftDocument
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How African Fabric and Designs Kenya Ltd. collects, uses and protects personal data. Approved wording will replace this outline."
      reviewer="legal"
      sections={[
        { title: "Who we are", covers: "The data controller's legal details and contact address." },
        { title: "Data we collect", covers: "Contact, delivery, order, account and Tax ID information, and how each is collected." },
        { title: "How we use it", covers: "Purposes and lawful bases, including order fulfilment and tax compliance." },
        { title: "Sharing", covers: "Couriers, payment providers and other processors, once selected." },
        { title: "Retention", covers: "How long each category of data is kept, including minimal Tax ID retention." },
        { title: "Your rights", covers: "Access, correction and deletion rights under applicable law, including Kenya's Data Protection Act." },
        { title: "Cookies & local storage", covers: "This site currently stores your cart in your browser's local storage only." },
        { title: "Contact", covers: "How to raise a privacy question or complaint." },
      ]}
    />
  );
}
