import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactDetailsForm, SettingsForm } from "@/components/admin/admin-forms";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { centsToAmount } from "@/lib/checkout/pricing";
import { getCheckoutSettings } from "@/lib/checkout/settings";
import { getContactDetails } from "@/lib/contact-server";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Shop settings"
        description="How customers reach you, and the delivery fee and tax rate they're charged at checkout."
      />
      <div className="space-y-12">
        <Suspense fallback={<PanelSkeleton className="h-[26rem]" />}>
          <Contact />
        </Suspense>
        <Suspense fallback={<PanelSkeleton className="h-[32rem]" />}>
          <Settings />
        </Suspense>
      </div>
    </>
  );
}

async function Contact() {
  await requireAdmin("/admin/settings");
  const contact = await getContactDetails();
  return <ContactDetailsForm contact={contact} />;
}

async function Settings() {
  await requireAdmin("/admin/settings");
  const settings = await getCheckoutSettings();
  return (
    <SettingsForm
      taxRate={centsToAmount(BigInt(settings.taxRateBps)).replace(/\.?0+$/, "")}
      shippingFee={centsToAmount(BigInt(settings.shippingFeeCents))}
      shippingFeeIsPlaceholder={settings.shippingFeeIsPlaceholder}
    />
  );
}
