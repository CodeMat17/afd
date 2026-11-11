"use server";

import { ConvexError } from "convex/values";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import {
  createUploadSignature,
  deleteImages,
  HERO_FOLDER,
  isCloudinaryConfigured,
  isOwnImage,
  type UploadSignature,
} from "@/lib/cloudinary";
import { api, convexClient, serverSecret } from "@/lib/convex/server";
import { HERO_TAG } from "@/lib/repository";

export type HeroActionResult = { ok: boolean; message: string };

const MAX_HERO_IMAGES = 24;

/** Lets the browser upload hero photos straight to Cloudinary (folder afd/hero). */
export async function getHeroUploadSignature(): Promise<UploadSignature | { error: string }> {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary isn't configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)." };
  }
  return createUploadSignature(HERO_FOLDER);
}

const imagesSchema = z
  .array(
    z.object({
      publicId: z.string().min(1).max(255),
      url: z.url(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  )
  .max(MAX_HERO_IMAGES, `The hero can show at most ${MAX_HERO_IMAGES} photos.`);

/**
 * Saves the hero photos and refreshes only the hero's cache entry. This is
 * the one thing that changes the hero on the home page.
 */
export async function saveHero(input: unknown): Promise<HeroActionResult> {
  await requireAdmin();
  const parsed = imagesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Photo list was malformed." };
  const images = parsed.data.map(({ publicId, url, width, height }) => ({ publicId, url, width, height }));
  if (images.some((image) => !isOwnImage(image.publicId, image.url))) {
    return { ok: false, message: "One of the photos isn't from this store's Cloudinary account." };
  }

  let orphanedPublicIds: string[];
  try {
    ({ orphanedPublicIds } = await convexClient().mutation(api.hero.save, { serverSecret: serverSecret(), images }));
  } catch (error) {
    if (error instanceof ConvexError && typeof error.data === "string") return { ok: false, message: error.data };
    console.error("[admin] failed to save hero", error);
    return { ok: false, message: "Couldn't save the hero. Please try again." };
  }

  const photosRemoved = await deleteImages(orphanedPublicIds);
  updateTag(HERO_TAG);
  if (!photosRemoved) {
    return {
      ok: true,
      message: "Saved, but removed photos couldn't be deleted from Cloudinary. They're unused and can be deleted from the Cloudinary console (folder afd/hero).",
    };
  }
  return {
    ok: true,
    message: images.length === 0 ? "Saved. The hero shows no photos until you add some." : "Saved. The home page shows the new hero now.",
  };
}
