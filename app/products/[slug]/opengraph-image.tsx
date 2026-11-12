import { renderOgCard } from "@/lib/og-card";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";

export const alt = `A product from ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const FALLBACK_PHOTO = "/images/wooven-kente/1000294627-680x920.jpg";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  const category = product ? await catalog.getCategoryById(product.categoryId) : null;

  const photos = product
    ? [...product.images]
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
        .map((i) => i.imageUrl)
    : [];

  return renderOgCard({
    eyebrow: category?.name ?? "Nairobi showroom",
    title: product?.name ?? site.name,
    subtitle: product?.details.material,
    photos: photos.length ? photos : [category?.imageUrl ?? FALLBACK_PHOTO],
  });
}
