import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Container, PageHeader } from "@/components/ui/section";
import { catalog } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Ankara, Kente, Isiagu and beaded lace up close — photographed in our Nairobi showroom.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const images = await catalog.getGalleryImages();
  return (
    <>
      <PageHeader
        eyebrow="The gallery"
        title={
          <>
            Through <em className="text-primary">the lens</em>
          </>
        }
        description="Texture, sheen and scale, photographed in the showroom. Tap any image to view it full screen."
      />
      <Container className="py-12 lg:py-16">
        <GalleryGrid images={images} />
      </Container>
    </>
  );
}
