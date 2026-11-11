"use server";

import { ConvexError } from "convex/values";
import { updateTag } from "next/cache";
import { z } from "zod";
import type { Id } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin/session";
import {
  createUploadSignature,
  deleteImages,
  GALLERY_FOLDER,
  isCloudinaryConfigured,
  isOwnImage,
  type UploadSignature,
} from "@/lib/cloudinary";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { CATALOG_TAG } from "@/lib/repository";

export type GalleryActionResult = { ok: boolean; message: string; id?: string };

const CLOUDINARY_LEFTOVER =
  "but the old photo couldn't be deleted from Cloudinary. It's unused and can be deleted from the Cloudinary console (folder afd/gallery).";

/** Lets the browser upload gallery photos straight to Cloudinary (folder afd/gallery). */
export async function getGalleryUploadSignature(): Promise<UploadSignature | { error: string }> {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary isn't configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)." };
  }
  return createUploadSignature(GALLERY_FOLDER);
}

const imageSchema = z.object({
  publicId: z.string().min(1).max(255),
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const textSchema = z.object({
  caption: z.string().trim().min(1, "Add a caption.").max(120, "Captions are at most 120 characters."),
  altText: z
    .string()
    .trim()
    .min(1, "Add a description for screen readers.")
    .max(300, "Descriptions are at most 300 characters."),
  productSlug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Unknown product.")
    .max(120)
    .optional()
    .transform((slug) => slug || undefined),
});

const idSchema = z.string().min(1).max(64);

const addSchema = textSchema.extend({ image: imageSchema });
const updateSchema = textSchema.extend({ id: idSchema, image: imageSchema.optional() });

function pickImage(image: z.infer<typeof imageSchema>) {
  return { publicId: image.publicId, url: image.url, width: image.width, height: image.height };
}

function failure(error: unknown, what: string): GalleryActionResult {
  if (error instanceof ConvexError && typeof error.data === "string") return { ok: false, message: error.data };
  console.error(`[admin] failed to ${what} gallery photo`, error);
  return { ok: false, message: `Couldn't ${what} the photo. Please try again.` };
}

/** Adds a newly uploaded photo, with its text, to the end of the gallery. */
export async function addGalleryPhoto(input: unknown): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Photo was malformed." };
  const { image, ...text } = parsed.data;
  if (!isOwnImage(image.publicId, image.url)) {
    return { ok: false, message: "That photo isn't from this store's Cloudinary account." };
  }
  try {
    const id = await convexClient().mutation(api.gallery.add, {
      serverSecret: serverSecret(),
      kind: "gallery",
      image: pickImage(image),
      ...text,
    });
    updateTag(CATALOG_TAG);
    return { ok: true, id, message: "Added. The gallery page shows it now." };
  } catch (error) {
    return failure(error, "add");
  }
}

/** Saves a photo's text and, if a replacement was uploaded, swaps the photo (deleting the old one from Cloudinary). */
export async function updateGalleryPhoto(input: unknown): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Photo was malformed." };
  const { id, image, ...text } = parsed.data;
  if (image && !isOwnImage(image.publicId, image.url)) {
    return { ok: false, message: "That photo isn't from this store's Cloudinary account." };
  }
  let orphanedPublicIds: string[];
  try {
    ({ orphanedPublicIds } = await convexClient().mutation(api.gallery.update, {
      serverSecret: serverSecret(),
      id: id as Id<"galleryImages">,
      image: image ? pickImage(image) : undefined,
      ...text,
    }));
  } catch (error) {
    return failure(error, "save");
  }
  const removed = await deleteImages(orphanedPublicIds);
  updateTag(CATALOG_TAG);
  return { ok: true, message: removed ? "Saved. The gallery page shows the change now." : `Saved, ${CLOUDINARY_LEFTOVER}` };
}

/** Deletes a photo and its text from the gallery, and the file from Cloudinary. */
export async function deleteGalleryPhoto(id: unknown): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: "Unknown photo." };
  let orphanedPublicIds: string[];
  try {
    ({ orphanedPublicIds } = await convexClient().mutation(api.gallery.remove, {
      serverSecret: serverSecret(),
      id: parsed.data as Id<"galleryImages">,
    }));
  } catch (error) {
    return failure(error, "delete");
  }
  const removed = await deleteImages(orphanedPublicIds);
  updateTag(CATALOG_TAG);
  if (!removed) {
    return {
      ok: true,
      message:
        "Removed from the gallery, but the file couldn't be deleted from Cloudinary. It's unused and can be deleted from the Cloudinary console (folder afd/gallery).",
    };
  }
  return {
    ok: true,
    message:
      orphanedPublicIds.length > 0
        ? "Removed from the gallery and deleted from Cloudinary."
        : "Removed from the gallery. The file was kept in Cloudinary because a product or the hero still uses it.",
  };
}

/** Moves a photo one place earlier (-1) or later (1). */
export async function moveGalleryPhoto(id: unknown, by: unknown): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = z.object({ id: idSchema, by: z.union([z.literal(-1), z.literal(1)]) }).safeParse({ id, by });
  if (!parsed.success) return { ok: false, message: "Couldn't move the photo." };
  try {
    await convexClient().mutation(api.gallery.move, {
      serverSecret: serverSecret(),
      id: parsed.data.id as Id<"galleryImages">,
      by: parsed.data.by,
    });
  } catch (error) {
    return failure(error, "move");
  }
  updateTag(CATALOG_TAG);
  return { ok: true, message: "Moved." };
}

/**
 * Deletes uploads that were never saved (a new photo that was cancelled, a
 * replacement that was discarded). Only files in afd/gallery that nothing
 * uses are touched.
 */
export async function discardGalleryUploads(publicIds: unknown): Promise<void> {
  await requireAdmin();
  const parsed = z.array(z.string().min(1).max(255)).max(50).safeParse(publicIds);
  if (!parsed.success) return;
  const ids = parsed.data.filter((id) => id.startsWith(`${GALLERY_FOLDER}/`));
  if (ids.length === 0) return;
  try {
    const unused = await convexClient().mutation(api.gallery.releasable, { serverSecret: serverSecret(), publicIds: ids });
    await deleteImages(unused);
  } catch (error) {
    console.error("[admin] failed to discard gallery uploads", error);
  }
}
