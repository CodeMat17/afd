import { renderOgCard } from "@/lib/og-card";
import { catalog, getCatalogTree } from "@/lib/repository";
import { site } from "@/lib/site";

export const alt = `A collection from ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FALLBACK_PHOTO = "/images/wooven-kente/1000294627-680x920.jpg";

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const tree = await getCatalogTree();
  const department = tree.find((d) => d.slug === slug);
  const parent = department ?? tree.find((d) => d.categories.some((c) => c.slug === slug));
  const category = department ? null : parent?.categories.find((c) => c.slug === slug);

  const products = department
    ? await catalog.getProductsByDepartment(slug)
    : category
      ? await catalog.getProductsByCategory(slug)
      : [];

  const cover = category?.imageUrl ?? parent?.imageUrl;
  const productPhotos = products.map((p) => p.images[0]?.imageUrl).filter((u): u is string => Boolean(u));
  const photos = [...new Set([cover, ...productPhotos].filter((u): u is string => Boolean(u)))];

  return renderOgCard({
    eyebrow: category ? (parent?.name ?? "Shop") : "Shop the collection",
    title: category?.name ?? parent?.name ?? site.name,
    subtitle: category?.tagline ?? parent?.tagline,
    photos: photos.length ? photos : [FALLBACK_PHOTO],
  });
}
