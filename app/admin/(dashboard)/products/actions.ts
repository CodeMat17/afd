"use server";

import { ConvexError } from "convex/values";
import { updateTag } from "next/cache";
import { z } from "zod";
import type { Id } from "@/convex/_generated/dataModel";
import { fieldRules, SIZE_LABELS, slugify } from "@/lib/admin/product-fields";
import { requireAdmin } from "@/lib/admin/session";
import { createUploadSignature, deleteImages, isCloudinaryConfigured, isOwnImage, type UploadSignature } from "@/lib/cloudinary";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { CATALOG_TAG } from "@/lib/repository";

export type ProductFormState = {
  ok: boolean;
  message: string;
  /** Per-field problems, keyed by input name, so the form can mark each one. */
  errors?: Record<string, string>;
  /** Set when a new product was created, so the form can link to it. */
  created?: { id: string; slug: string };
} | null;

function invalid(errors: Record<string, string>): ProductFormState {
  const count = Object.keys(errors).length;
  return {
    ok: false,
    message: count === 1 ? Object.values(errors)[0] : `${count} fields need attention. They're marked below.`,
    errors,
  };
}

/** Lets the browser upload one batch of photos straight to Cloudinary. */
export async function getUploadSignature(): Promise<UploadSignature | { error: string }> {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary isn't configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)." };
  }
  return createUploadSignature();
}

const text = (max: number) => z.string().trim().max(max);
const optional = (max = 120) =>
  text(max).transform((value) => (value === "" ? undefined : value));

const imageSchema = z.object({
  publicId: z.string().min(1).max(255),
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  altText: text(300),
});

const productSchema = z.object({
  id: optional(64),
  name: text(120).min(2, "Name is required."),
  categoryId: text(64).min(1, "Choose a category."),
  price: z.string().trim().regex(/^\d{1,7}(\.\d{1,2})?$/, "Price must be a USD amount such as 6.50."),
  description: text(2000).min(1, "Description is required."),
  colours: text(400).min(1, "List at least one colour."),
  /** Pieces in stock. Required for every product; 0 means sold out. */
  stockQuantity: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, "Enter how many pieces you have, as a whole number (0 if sold out)."),
  /** The level shown when the form loaded ("" = not tracked), to catch a sale made meanwhile. */
  stockExpected: z.string().trim().max(10).optional(),
  material: text(120).min(1, "Material is required."),
  pieceLength: optional(60),
  care: text(300).min(1, "Care instructions are required."),
  patternNotes: optional(300),
  bust: optional(40),
  waist: optional(40),
  chest: optional(40),
  trouser: optional(40),
  shoulder: optional(40),
  sleeve: optional(40),
  topLength: optional(40),
  hips: optional(40),
  dressLength: optional(40),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(imageSchema).max(12, "A product can have at most 12 photos."),
});

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  let images: unknown;
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    return { ok: false, message: "Photo list was malformed. Reload the page and try again." };
  }
  const field = (name: string) => String(formData.get(name) ?? "");
  const parsed = productSchema.safeParse({
    id: field("id"),
    name: field("name"),
    categoryId: field("categoryId"),
    price: field("price"),
    description: field("description"),
    colours: field("colours"),
    stockQuantity: field("stockQuantity"),
    stockExpected: formData.has("stockExpected") ? field("stockExpected") : undefined,
    material: field("material"),
    pieceLength: field("pieceLength"),
    care: field("care"),
    patternNotes: field("patternNotes"),
    bust: field("bust"),
    waist: field("waist"),
    chest: field("chest"),
    trouser: field("trouser"),
    shoulder: field("shoulder"),
    sleeve: field("sleeve"),
    topLength: field("topLength"),
    hips: field("hips"),
    dressLength: field("dressLength"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    images,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return invalid(errors);
  }
  const p = parsed.data;

  if (p.images.some((image) => !isOwnImage(image.publicId, image.url))) {
    return { ok: false, message: "One of the photos isn't from this store's Cloudinary account." };
  }

  // The category decides which fields apply; irrelevant ones are dropped so a
  // product moved between categories doesn't keep stale details.
  const catalog = await convexClient().query(api.catalog.snapshot, {});
  const category = catalog.categories.find((c) => c._id === p.categoryId);
  const department = catalog.departments.find((d) => d._id === category?.departmentId);
  if (!category || !department) return invalid({ categoryId: "That category no longer exists. Choose another." });
  const rules = fieldRules(department.slug, category.slug);

  const ruleErrors: Record<string, string> = {};
  if (rules.pieceLength && !p.pieceLength) ruleErrors.pieceLength = "Piece length is required for fabrics.";
  for (const key of rules.sizes) {
    if (!p[key]) ruleErrors[key] = `${SIZE_LABELS[key]} is required for this category.`;
  }
  if (Object.keys(ruleErrors).length > 0) return invalid(ruleErrors);
  const sizes = Object.fromEntries(rules.sizes.map((key) => [key, p[key]]));
  const hasSizes = rules.sizes.length > 0;

  // New products take their slug from the name. An existing product keeps its
  // slug so links already shared (WhatsApp, search engines) keep working.
  const existing = p.id ? catalog.products.find((product) => product._id === p.id) : undefined;
  if (p.id && !existing) return { ok: false, message: "Product not found." };
  // The admin never sees the slug, so a clash with another product's name is
  // resolved here (gold-bloom → gold-bloom-2) rather than reported as an error.
  let slug = existing?.slug ?? "";
  if (!existing) {
    const base = slugify(p.name);
    if (!base) return invalid({ name: "The name needs at least one letter or number." });
    const taken = new Set(catalog.products.map((product) => product.slug));
    slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  }
  const plain = <T extends object>(value: T) => JSON.parse(JSON.stringify(value)) as T;

  let result: { id: Id<"products">; orphanedPublicIds: string[] };
  try {
    result = await convexClient().mutation(
      api.catalog.saveProduct,
      plain({
        serverSecret: serverSecret(),
        id: p.id as Id<"products"> | undefined,
        categoryId: p.categoryId as Id<"categories">,
        name: p.name,
        slug,
        price: p.price,
        description: p.description,
        unit: "piece" as const,
        minimumQuantity: "1",
        quantityStep: "1",
        stock: Number(p.stockQuantity),
        // "" in the form means the product wasn't tracked when it was opened.
        expectedStock: p.id && p.stockExpected !== undefined ? p.stockExpected || null : undefined,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        colours: p.colours
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        details: {
          material: p.material,
          pieceLength: rules.pieceLength ? p.pieceLength : undefined,
          care: p.care,
          patternNotes: p.patternNotes,
        },
        sizes: hasSizes ? sizes : undefined,
        images: p.images.map((image) => ({ ...image, altText: image.altText || p.name })),
      }),
    );
  } catch (error) {
    if (error instanceof ConvexError && typeof error.data === "string") return { ok: false, message: error.data };
    console.error("[admin] failed to save product", error);
    return { ok: false, message: "Couldn't save the product. Please try again." };
  }

  const photosRemoved = await deleteImages(result.orphanedPublicIds);
  updateTag(CATALOG_TAG);
  if (!photosRemoved) {
    return {
      ok: true,
      message: "Saved, but removed photos couldn't be deleted from Cloudinary. They're unused and can be deleted from the Cloudinary console.",
      created: p.id ? undefined : { id: result.id, slug },
    };
  }
  if (!p.id) {
    return {
      ok: true,
      message: `“${p.name}” is live on the storefront. The form is cleared for the next product.`,
      created: { id: result.id, slug },
    };
  }
  return { ok: true, message: "Saved. The storefront shows the change now." };
}

export type ActionResult = { ok: boolean; message: string };

/**
 * Deletes the product from Convex, then its photos from Cloudinary. Photos
 * another product, category or gallery entry still uses are kept.
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const productId = z.string().min(1).max(64).safeParse(id);
  if (!productId.success) return { ok: false, message: "Product not found." };

  let orphanedPublicIds: string[];
  try {
    ({ orphanedPublicIds } = await convexClient().mutation(api.catalog.deleteProduct, {
      serverSecret: serverSecret(),
      id: productId.data as Id<"products">,
    }));
  } catch (error) {
    console.error("[admin] failed to delete product", error);
    return { ok: false, message: "Couldn't delete the product. Please try again." };
  }

  const photosRemoved = await deleteImages(orphanedPublicIds);
  updateTag(CATALOG_TAG);
  if (!photosRemoved) {
    return {
      ok: true,
      message:
        "Product deleted, but its photos couldn't be removed from Cloudinary. They're unused and can be deleted from the Cloudinary console (folder afd/products).",
    };
  }
  const count = orphanedPublicIds.length;
  return {
    ok: true,
    message: count > 0 ? `Product and ${count} ${count === 1 ? "photo" : "photos"} deleted.` : "Product deleted.",
  };
}
