import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HeroForm } from "@/components/admin/hero-form";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { dateTime } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient } from "@/lib/convex/server";

export const metadata: Metadata = { title: "Home page hero" };

export default function AdminHeroPage() {
  return (
    <>
      <PageHeader
        eyebrow="Storefront"
        title="Home page hero"
        description="The photos scrolling beside the headline at the top of the home page. They're separate from your products and only change when you save here."
        actions={
          <Link href="/" target="_blank" className={buttonVariants({ variant: "outline" })}>
            <ExternalLink aria-hidden="true" />
            View home page
          </Link>
        }
      />
      <Suspense fallback={<PanelSkeleton className="h-[32rem]" />}>
        <Hero />
      </Suspense>
    </>
  );
}

async function Hero() {
  await requireAdmin("/admin/hero");
  // Uncached, so the form always starts from what's saved.
  const { images, updatedAt } = await convexClient().query(api.hero.get, {});
  return (
    <HeroForm
      // A save remounts the form with the stored list.
      key={updatedAt ?? 0}
      images={images}
      updatedAt={updatedAt === null ? null : dateTime.format(updatedAt)}
    />
  );
}
