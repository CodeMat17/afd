/**
 * Import the starter catalogue into Convex, uploading its photos to Cloudinary.
 *
 *   yarn seed:catalog
 *
 * Reads lib/data/*.ts and the files they reference under /public/images.
 * Safe to re-run: Cloudinary uploads use fixed public IDs with
 * overwrite=false, and the Convex `catalog:seed` mutation skips rows whose
 * slug / SKU already exist, so admin edits are never overwritten.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const { mockCategories, mockDepartments } = await import("../lib/data/categories.ts");
const { mockProducts } = await import("../lib/data/products.ts");
const { mockGallery } = await import("../lib/data/gallery.ts");
const { mockEditorial } = await import("../lib/data/editorial.ts");

const env = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name} (set it in .env.local).`);
    process.exit(1);
  }
  return value;
};

const cloudName = env("CLOUDINARY_CLOUD_NAME");
const apiKey = env("CLOUDINARY_API_KEY");
const apiSecret = env("CLOUDINARY_API_SECRET");
const convex = new ConvexHttpClient(env("NEXT_PUBLIC_CONVEX_URL"));
const serverSecret = env("CONVEX_SERVER_SECRET");

const publicDir = path.join(import.meta.dirname, "..", "public");

function sign(params) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

/** "/images/ankara/abc-680x920.jpg" → "afd/catalog/ankara/abc-680x920" */
const publicIdFor = (localPath) => `afd/catalog/${localPath.replace(/^\/images\//, "").replace(/\.[a-z]+$/i, "")}`;

const uploads = new Map();

/** Upload once per local file; returns the Convex `cloudImage` reference. */
function upload(localPath) {
  if (!uploads.has(localPath)) uploads.set(localPath, doUpload(localPath));
  return uploads.get(localPath);
}

async function doUpload(localPath) {
  const file = await readFile(path.join(publicDir, localPath));
  const params = {
    overwrite: "false",
    public_id: publicIdFor(localPath),
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const body = new FormData();
  body.append("file", new Blob([file]), path.basename(localPath));
  for (const [key, value] of Object.entries(params)) body.append(key, value);
  body.append("api_key", apiKey);
  body.append("signature", sign(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  const result = await response.json();
  if (!response.ok) throw new Error(`Upload of ${localPath} failed: ${result.error?.message ?? response.status}`);
  console.log(`${result.existing ? "  exists " : "uploaded "} ${result.public_id}`);
  return { publicId: result.public_id, url: result.secure_url, width: result.width, height: result.height };
}

/** Run uploads a few at a time. */
async function pool(paths, size = 4) {
  const queue = [...new Set(paths)];
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) await upload(queue.shift());
    }),
  );
}

const allPaths = [
  ...mockDepartments.map((d) => d.imageUrl),
  ...mockCategories.map((c) => c.imageUrl),
  ...mockProducts.flatMap((p) => p.images.map((i) => i.imageUrl)),
  ...mockGallery.map((g) => g.imageUrl),
  ...mockEditorial.map((g) => g.imageUrl),
].filter(Boolean);

console.log(`Uploading ${new Set(allPaths).size} photos to Cloudinary (${cloudName})…`);
await pool(allPaths);

const departmentSlug = new Map(mockDepartments.map((d) => [d.id, d.slug]));
const categorySlug = new Map(mockCategories.map((c) => [c.id, c.slug]));
const optionalImage = async (url) => (url ? { image: await upload(url) } : {});

const payload = {
  departments: await Promise.all(
    mockDepartments.map(async (d) => ({
      slug: d.slug,
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      sortOrder: d.sortOrder,
      ...(await optionalImage(d.imageUrl)),
    })),
  ),
  categories: await Promise.all(
    mockCategories.map(async (c) => ({
      departmentSlug: departmentSlug.get(c.departmentId),
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      sortOrder: c.sortOrder,
      ...(await optionalImage(c.imageUrl)),
    })),
  ),
  products: await Promise.all(
    mockProducts.map(async (p) => ({
      categorySlug: categorySlug.get(p.categoryId),
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      minimumQuantity: p.minimumQuantity,
      quantityStep: p.quantityStep,
      stockQuantity: p.stockQuantity,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
      colours: p.colours,
      details: p.details,
      sizes: p.sizes,
      images: await Promise.all(
        [...p.images]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(async (i) => ({ ...(await upload(i.imageUrl)), altText: i.altText })),
      ),
    })),
  ),
  gallery: await Promise.all([
    ...mockGallery.map(async (g, i) => galleryRow("gallery", g, i)),
    ...mockEditorial.map(async (g, i) => galleryRow("editorial", g, i)),
  ]),
};

async function galleryRow(kind, g, sortOrder) {
  return {
    kind,
    image: await upload(g.imageUrl),
    altText: g.altText,
    caption: g.caption,
    productSlug: g.productSlug,
    sortOrder,
  };
}

// Drop `undefined` fields, which Convex rejects.
const clean = JSON.parse(JSON.stringify(payload));
const inserted = await convex.mutation(anyApi.catalog.seed, { serverSecret, ...clean });
console.log("Inserted into Convex:", inserted);
console.log("Restart `yarn dev` (or wait up to an hour) for the storefront cache to pick up the data.");
