import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GalleryManager } from "@/components/admin/gallery-form";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { api, convexClient } from "@/lib/convex/server";

export const metadata: Metadata = { title: "Gallery" };

export default function AdminGalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Storefront"
        title="Gallery"
        description="The looks on the /gallery page. Add photos, edit each one's caption and description, replace or delete a photo, and set the order. Each change goes live as soon as you save it."
        actions={
          <Link href="/gallery" target="_blank" className={buttonVariants({ variant: "outline" })}>
            <ExternalLink aria-hidden="true" />
            View gallery
          </Link>
        }
      />
      <Suspense fallback={<PanelSkeleton className="h-128" />}>
        <Gallery />
      </Suspense>
    </>
  );
}

async function Gallery() {
  await requireAdmin("/admin/gallery");
  // Uncached, so the page always shows what's saved.
  const [rows, snapshot] = await Promise.all([
    convexClient().query(api.gallery.list, { kind: "gallery" }),
    convexClient().query(api.catalog.snapshot, {}),
  ]);
  const photos = rows.map((row) => ({
    id: row._id,
    image: row.image,
    caption: row.caption,
    altText: row.altText,
    productSlug: row.productSlug ?? "",
  }));
  const products = snapshot.products
    .map((p) => ({ slug: p.slug, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <GalleryManager photos={photos} products={products} />;
}
