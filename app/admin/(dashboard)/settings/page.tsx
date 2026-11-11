import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/admin/admin-forms";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { centsToAmount } from "@/lib/checkout/pricing";
import { getCheckoutSettings } from "@/lib/checkout/settings";

export const metadata: Metadata = { title: "Checkout settings" };

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Checkout settings"
        description="The delivery fee and tax rate your customers are charged at checkout."
      />
      <Suspense fallback={<PanelSkeleton className="h-[32rem]" />}>
        <Settings />
      </Suspense>
    </>
  );
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
