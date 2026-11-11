import { CategoryShowcase } from "@/components/home/category-showcase";
import { ClosingCta } from "@/components/home/closing-cta";
import { Editorial } from "@/components/home/editorial";
import { FabricTicker } from "@/components/home/fabric-ticker";
import { FeaturedProducts } from "@/components/home/featured-products";
import { GalleryReel } from "@/components/home/gallery-reel";
import { Hero } from "@/components/home/hero";
import { ShoppingInfo } from "@/components/home/shopping-info";
import { catalog, getCatalogTree } from "@/lib/repository";
import type { GalleryImage, Product } from "@/lib/types";

/** Take one item from each queue in turn until `limit` is reached. */
function roundRobin<T>(queues: T[][], limit: number): T[] {
  const pending = queues.map((q) => [...q]);
  const result: T[] = [];
  while (result.length < limit && pending.some((q) => q.length > 0)) {
    for (const queue of pending) {
      const next = queue.shift();
      if (next !== undefined && result.length < limit) result.push(next);
    }
  }
  return result;
}

/** Round-robin products across categories so a list never clusters on one category. */
function interleaveByCategory(products: Product[], limit = products.length): Product[] {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    groups.set(p.categoryId, [...(groups.get(p.categoryId) ?? []), p]);
  }
  return roundRobin([...groups.values()], limit);
}

/**
 * Featured products spread across every department (Fabrics, Clothing,
 * Headwear, Accessories…). Items flagged as featured lead within each
 * department; a department with nothing flagged is backfilled with its newest
 * products so no part of the store is left out of the home page.
 */
function pickFeatured(productsByDepartment: Product[][], limit: number): Product[] {
  const queues = productsByDepartment.map((items) => {
    const available = items.filter((p) => p.isAvailable && p.images.length > 0);
    const flagged = available.filter((p) => p.isFeatured);
    const rest = available
      .filter((p) => !p.isFeatured)
      .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
    return [...interleaveByCategory(flagged), ...interleaveByCategory(rest)];
  });
  return roundRobin(queues, limit);
}

function toReelImage(p: Product): GalleryImage {
  const image = p.images[0];
  return {
    id: `product-${p.id}`,
    imageUrl: image.imageUrl,
    altText: image.altText || p.name,
    caption: p.name,
    width: image.width,
    height: image.height,
    productSlug: p.slug,
  };
}

export default async function HomePage() {
  const [categories, departments, products, gallery, heroImages] = await Promise.all([
    catalog.getCategories(),
    getCatalogTree(),
    catalog.getProducts(),
    catalog.getEditorialImages(),
    // Set only from /admin/hero, never from the products.
    catalog.getHeroImages(),
  ]);

  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Group products by department so the home page represents the whole store.
  const activeDepartments = departments.filter((d) => d.productCount > 0);
  const departmentNames = activeDepartments.map((d) => d.name);
  const productsByDepartment = activeDepartments.map((d) => {
    const ids = new Set(d.categories.map((c) => c.id));
    return products.filter((p) => ids.has(p.categoryId));
  });

  const featured = pickFeatured(productsByDepartment, 8);

  // The reel mixes the editorial shots with product photography from each
  // department, so clothing, headwear and accessories sit alongside fabric.
  const productShots = productsByDepartment.map((items) =>
    interleaveByCategory(items.filter((p) => p.images[0])).map(toReelImage),
  );
  const seen = new Set<string>();
  const reelImages = roundRobin([gallery, ...productShots], 40)
    .filter((img) => !seen.has(img.imageUrl) && Boolean(seen.add(img.imageUrl)))
    .slice(0, 10);

  const editorialPrimary = gallery.find((g) => g.id === "g-01") ?? gallery[0];
  const editorialSecondary = gallery.find((g) => g.id === "g-05") ?? gallery[1];
  const closing = gallery.find((g) => g.id === "g-07") ?? gallery[0];

  return (
    <>
      <Hero
        images={heroImages}
        categoryNames={categories.map((c) => c.name)}
      />
      <FabricTicker names={categories.map((c) => c.name)} />
      <CategoryShowcase departments={departments} />
      <FeaturedProducts
        products={featured}
        categoryNames={categoryNames}
        departmentNames={departmentNames}
      />
      {editorialPrimary && editorialSecondary ? (
        <Editorial
          primary={{ src: editorialPrimary.imageUrl, alt: editorialPrimary.altText }}
          secondary={{ src: editorialSecondary.imageUrl, alt: editorialSecondary.altText }}
        />
      ) : null}
      <GalleryReel images={reelImages} departmentNames={departmentNames} />
      <ShoppingInfo />
      {closing ? <ClosingCta image={{ src: closing.imageUrl, alt: closing.altText }} /> : null}
    </>
  );
}
