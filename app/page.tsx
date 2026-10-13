import { CategoryShowcase } from "@/components/home/category-showcase";
import { ClosingCta } from "@/components/home/closing-cta";
import { Editorial } from "@/components/home/editorial";
import { FabricTicker } from "@/components/home/fabric-ticker";
import { FeaturedProducts } from "@/components/home/featured-products";
import { GalleryReel } from "@/components/home/gallery-reel";
import { Hero, type HeroImage } from "@/components/home/hero";
import { ShoppingInfo } from "@/components/home/shopping-info";
import { catalog } from "@/lib/repository";
import type { Product } from "@/lib/types";

/** Round-robin products across categories so the hero reel feels varied. */
function interleaveByCategory(products: Product[], limit: number): Product[] {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    groups.set(p.categoryId, [...(groups.get(p.categoryId) ?? []), p]);
  }
  const queues = [...groups.values()];
  const result: Product[] = [];
  while (result.length < limit && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < limit) result.push(next);
    }
  }
  return result;
}

export default async function HomePage() {
  const [categories, products, featured, gallery] = await Promise.all([
    catalog.getCategories(),
    catalog.getProducts(),
    catalog.getFeaturedProducts(8),
    catalog.getGalleryImages(),
  ]);

  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;

  const heroImages: HeroImage[] = interleaveByCategory(products, 15).map((p) => ({
    src: p.images[0]?.imageUrl ?? "",
    alt: p.images[0]?.altText ?? p.name,
  }));

  const editorialPrimary = gallery.find((g) => g.id === "g-01") ?? gallery[0];
  const editorialSecondary = gallery.find((g) => g.id === "g-05") ?? gallery[1];
  const closing = gallery.find((g) => g.id === "g-07") ?? gallery[0];

  return (
    <>
      <Hero images={heroImages} />
      <FabricTicker names={categories.map((c) => c.name)} />
      <CategoryShowcase categories={categories} counts={counts} />
      <FeaturedProducts products={featured} categoryNames={categoryNames} />
      {editorialPrimary && editorialSecondary ? (
        <Editorial
          primary={{ src: editorialPrimary.imageUrl, alt: editorialPrimary.altText }}
          secondary={{ src: editorialSecondary.imageUrl, alt: editorialSecondary.altText }}
        />
      ) : null}
      <GalleryReel images={gallery.slice(0, 8)} />
      <ShoppingInfo />
      {closing ? <ClosingCta image={{ src: closing.imageUrl, alt: closing.altText }} /> : null}
    </>
  );
}
