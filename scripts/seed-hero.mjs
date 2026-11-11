/**
 * Fill an empty home page hero with 15 product photos as a placeholder.
 *
 *   yarn seed:hero            # only if the hero is empty
 *   yarn seed:hero --force    # replace whatever is there
 *
 * Takes each product's first photo, alternating between categories and
 * preferring portrait shots. No uploads: the hero points at the same
 * Cloudinary images as the products, so removing or replacing them later in
 * /admin/hero never deletes a product's photo (it's still referenced).
 */
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const COUNT = 15;

const env = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name} (set it in .env.local).`);
    process.exit(1);
  }
  return value;
};

const convex = new ConvexHttpClient(env("NEXT_PUBLIC_CONVEX_URL"));
const serverSecret = env("CONVEX_SERVER_SECRET");
const force = process.argv.includes("--force");

const current = await convex.query(anyApi.hero.get, {});
if (current.images.length > 0 && !force) {
  console.log(`The hero already has ${current.images.length} photos; left as is. Use --force to replace them.`);
  process.exit(0);
}

const { products } = await convex.query(anyApi.catalog.snapshot, {});

// First photo of each product, grouped by category, portrait shots first.
const byCategory = new Map();
for (const product of products) {
  const image = product.images?.[0];
  if (!image) continue;
  const list = byCategory.get(product.categoryId) ?? [];
  list.push(image);
  byCategory.set(product.categoryId, list);
}
for (const list of byCategory.values()) {
  list.sort((a, b) => Number(b.height > b.width) - Number(a.height > a.width));
}

// Deal one from each category in turn so the hero shows a mix.
const picked = [];
const seen = new Set();
const queues = [...byCategory.values()];
while (picked.length < COUNT && queues.some((q) => q.length > 0)) {
  for (const queue of queues) {
    const image = queue.shift();
    if (!image || seen.has(image.publicId)) continue;
    seen.add(image.publicId);
    picked.push({ publicId: image.publicId, url: image.url, width: image.width, height: image.height });
    if (picked.length === COUNT) break;
  }
}

if (picked.length < COUNT) {
  console.error(`Only found ${picked.length} product photos; the hero needs ${COUNT}.`);
  process.exit(1);
}

await convex.mutation(anyApi.hero.save, { serverSecret, images: picked });
console.log(`Hero filled with ${picked.length} product photos from ${byCategory.size} categories.`);
console.log(
  "Note: the site caches the hero until the next save in /admin/hero. Restart `next dev`, or redeploy, to see these now.",
);
